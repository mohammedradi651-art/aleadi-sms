import { getDb } from "@/lib/firebase-admin";
import {
  serverState,
  recordReaderHeartbeat,
  invalidateHistoryCache,
} from "@/lib/server-state";
import { NextResponse } from "next/server";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const SEVEN_MINUTES = 7 * 60 * 1000;
const FALLBACK_CHECK_INTERVAL = 60 * 1000; // التحقق من الداتابيز كل دقيقة كحد أقصى عند الخمول

type Message = {
  id: string;
  phone: string;
  message: string;
  createdAt: number;
  status: string;
  deliveredAt?: number;
};

// تخزين آخر وقت كتابة للنبض في Firestore لتوفير عمليات الكتابة (مرة كل 5 دقائق فقط بدلاً من كل 3 ثوانٍ)
let lastFirestoreHeartbeatWrite = 0;

export async function GET() {
  try {
    const now = Date.now();

    // =====================================================
    // 1. تسجيل نبض القارئ في الذاكرة (0 قراءات/كتابات)
    // =====================================================
    recordReaderHeartbeat();

    const db = getDb();

    // كتابة النبض في Firestore مرة واحدة كل 5 دقائق فقط للحفظ الدائم
    if (now - lastFirestoreHeartbeatWrite > 5 * 60 * 1000) {
      lastFirestoreHeartbeatWrite = now;
      db.collection("system")
        .doc("main-reader")
        .set(
          {
            lastSeen: now,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        )
        .catch(console.error);
    }

    // =====================================================
    // 2. التحقق الذكي من الذاكرة قبل استهلاك Firestore
    // =====================================================
    // إذا لم تكن هناك رسائل جديدة ولم يمر وقت التحقق الاحتياطي، الرد فوراً بدون قراءة قاعدة البيانات
    const timeSinceLastCheck = now - serverState.lastPendingCheck;
    if (!serverState.hasPending && timeSinceLastCheck < FALLBACK_CHECK_INTERVAL) {
      return NextResponse.json({
        success: true,
        message: null,
      });
    }

    // =====================================================
    // 3. جلب الرسائل المعلقة من Firestore فقط عند الحاجة
    // =====================================================
    serverState.lastPendingCheck = now;

    const snapshot = await db
      .collection("messages")
      .where("status", "==", "pending")
      .orderBy("createdAt", "asc")
      .limit(10)
      .get();

    if (snapshot.empty) {
      serverState.hasPending = false;
      return NextResponse.json({
        success: true,
        message: null,
      });
    }

    // البحث عن رسالة صالحة (لم تنتهِ مدتها)
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const age = now - data.createdAt;

      // حذف الرسائل القديمة جداً (أكثر من شهر)
      if (age >= ONE_MONTH_MS) {
        await doc.ref.delete();
        continue;
      }

      // تحويل الرسائل التي انتظرت أكثر من 7 دقائق دون سحب إلى فاشلة
      if (data.status === "pending" && age >= SEVEN_MINUTES) {
        await doc.ref.update({ status: "failed" });
        invalidateHistoryCache();
        continue;
      }

      // =====================================================
      // تسليم الرسالة وتحديث حالتها
      // =====================================================
      const deliveredAt = now;

      await doc.ref.update({
        status: "delivered",
        deliveredAt,
      });

      invalidateHistoryCache();

      const message: Message = {
        id: doc.id,
        phone: data.phone,
        message: data.message,
        createdAt: data.createdAt,
        status: "delivered",
        deliveredAt,
      };

      return NextResponse.json({
        success: true,
        message,
      });
    }

    // لا توجد رسائل صالحة متبقية
    serverState.hasPending = false;
    return NextResponse.json({
      success: true,
      message: null,
    });
  } catch (error) {
    console.error("PENDING ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}