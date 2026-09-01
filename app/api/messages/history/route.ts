import { getDb } from "@/lib/firebase-admin";
import { serverState, isReaderConnected } from "@/lib/server-state";
import { NextResponse } from "next/server";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const HISTORY_CACHE_TTL = 10 * 1000; // 10 ثوان كاش للوحة التحكم
const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000; // تنظيف كل 6 ساعات فقط

type Message = {
  id: string;
  phone: string;
  message: string;
  createdAt: number;
  status: string;
  deliveredAt?: number;
};

export async function GET(request: Request) {
  try {
    const now = Date.now();
    const db = getDb();
    
    // =====================================================
    // 1. جلب حالة القارئ من الذاكرة الحية (0 قراءات)
    // =====================================================
    const readerLastSeen = isReaderConnected() ? Date.now() : null;

    const oneMonthAgo = now - ONE_MONTH_MS;

    // =====================================================
    // 2. تنظيف الرسائل القديمة (مرة كل 6 ساعات فقط لتوفير العمليات)
    // =====================================================
    if (now - serverState.lastCleanupTime > CLEANUP_INTERVAL) {
      serverState.lastCleanupTime = now;
      db.collection("messages")
        .where("createdAt", "<", oneMonthAgo)
        .limit(50)
        .get()
        .then((expiredSnapshot) => {
          if (!expiredSnapshot.empty) {
            const batch = db.batch();
            expiredSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
            return batch.commit();
          }
        })
        .catch(console.error);
    }

    // =====================================================
    // 3. جلب آخر 100 رسالة للعرض (يكلف قراءات فقط عند وجود تحديث جديد)
    // =====================================================

    const snapshot = await db
      .collection("messages")
      .where("createdAt", ">=", oneMonthAgo)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const updateBatch = db.batch();
    let hasUpdates = false;

    const messages: Message[] = snapshot.docs.map((doc) => {
      let status = doc.data().status;
      const createdAt = doc.data().createdAt;
      
      // If message is pending for more than 7 minutes, mark it as failed
      if (status === "pending" && now - createdAt > 7 * 60 * 1000) {
        status = "failed";
        updateBatch.update(doc.ref, { status: "failed" });
        hasUpdates = true;
      }

      return {
        id: doc.id,
        phone: doc.data().phone,
        message: doc.data().message,
        createdAt,
        status,
        deliveredAt: doc.data().deliveredAt ?? undefined,
      };
    });

    if (hasUpdates) {
      await updateBatch.commit();
    }

    // =====================================================
    // إحصائيات
    // =====================================================

    const pending = messages.filter((m) => m.status === "pending").length;
    const delivered = messages.filter((m) => m.status === "delivered").length;
    const failed = messages.filter((m) => m.status === "failed").length;
    const failedBalance = messages.filter((m) => m.status === "failed_balance").length;

    // إحصائيات يومية للرسم البياني (آخر 7 أيام)
    const dailyStats: Record<string, { total: number; delivered: number; pending: number; failed: number; failedBalance: number }> = {};

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split("T")[0];
      dailyStats[dateKey] = { total: 0, delivered: 0, pending: 0, failed: 0, failedBalance: 0 };
    }

    messages.forEach((msg) => {
      const dateKey = new Date(msg.createdAt).toISOString().split("T")[0];
      if (dailyStats[dateKey]) {
        dailyStats[dateKey].total++;
        if (msg.status === "pending") dailyStats[dateKey].pending++;
        if (msg.status === "delivered") dailyStats[dateKey].delivered++;
        if (msg.status === "failed") dailyStats[dateKey].failed++;
        if (msg.status === "failed_balance") dailyStats[dateKey].failedBalance++;
      }
    });

    const chartData = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      ...stats,
    }));

    const responsePayload = {
      success: true,
      stats: {
        total: messages.length,
        pending,
        delivered,
        failed,
        failedBalance,
        successRate:
          messages.length > 0
            ? Math.round((delivered / messages.length) * 100)
            : 0,
      },
      readerLastSeen,
      chartData,
      messages,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("HISTORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}