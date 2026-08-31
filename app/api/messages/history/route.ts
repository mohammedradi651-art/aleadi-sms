import { getDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

type Message = {
  id: string;
  phone: string;
  message: string;
  createdAt: number;
  status: string;
  deliveredAt?: number;
};

export async function GET() {
  try {
    const db = getDb();
    const now = Date.now();
    const oneMonthAgo = now - ONE_MONTH_MS;

    // =====================================================
    // تنظيف الرسائل القديمة (أكثر من شهر)
    // =====================================================

    const expiredSnapshot = await db
      .collection("messages")
      .where("createdAt", "<", oneMonthAgo)
      .limit(50)
      .get();

    if (!expiredSnapshot.empty) {
      const batch = db.batch();
      expiredSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    // =====================================================
    // جلب حالة القارئ
    // =====================================================
    
    const readerDoc = await db.collection("system").doc("main-reader").get();
    const readerLastSeen = readerDoc.exists ? readerDoc.data()?.lastSeen : null;

    // =====================================================
    // جلب آخر 100 رسالة للعرض
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

    // إحصائيات يومية للرسم البياني (آخر 7 أيام)
    const dailyStats: Record<string, { total: number; delivered: number; pending: number; failed: number }> = {};

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split("T")[0];
      dailyStats[dateKey] = { total: 0, delivered: 0, pending: 0, failed: 0 };
    }

    messages.forEach((msg) => {
      const dateKey = new Date(msg.createdAt).toISOString().split("T")[0];
      if (dailyStats[dateKey]) {
        dailyStats[dateKey].total++;
        if (msg.status === "pending") dailyStats[dateKey].pending++;
        if (msg.status === "delivered") dailyStats[dateKey].delivered++;
        if (msg.status === "failed") dailyStats[dateKey].failed++;
      }
    });

    const chartData = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      ...stats,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        total: messages.length,
        pending,
        delivered,
        failed,
        successRate:
          messages.length > 0
            ? Math.round((delivered / messages.length) * 100)
            : 0,
      },
      readerLastSeen,
      chartData,
      messages,
    });
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