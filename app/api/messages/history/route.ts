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
    // جلب آخر 100 رسالة للعرض
    // =====================================================

    const snapshot = await db
      .collection("messages")
      .where("createdAt", ">=", oneMonthAgo)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const messages: Message[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      phone: doc.data().phone,
      message: doc.data().message,
      createdAt: doc.data().createdAt,
      status: doc.data().status,
      deliveredAt: doc.data().deliveredAt ?? undefined,
    }));

    // =====================================================
    // إحصائيات
    // =====================================================

    const pending = messages.filter((m) => m.status === "pending").length;
    const delivered = messages.filter((m) => m.status === "delivered").length;

    // إحصائيات يومية للرسم البياني (آخر 7 أيام)
    const dailyStats: Record<string, { total: number; delivered: number; pending: number }> = {};

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split("T")[0];
      dailyStats[dateKey] = { total: 0, delivered: 0, pending: 0 };
    }

    messages.forEach((msg) => {
      const dateKey = new Date(msg.createdAt).toISOString().split("T")[0];
      if (dailyStats[dateKey]) {
        dailyStats[dateKey].total++;
        if (msg.status === "pending") dailyStats[dateKey].pending++;
        if (msg.status === "delivered") dailyStats[dateKey].delivered++;
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
        successRate:
          messages.length > 0
            ? Math.round((delivered / messages.length) * 100)
            : 0,
      },
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