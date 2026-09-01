import { getDb } from "@/lib/firebase-admin";
import { notifyNewMessage } from "@/lib/server-state";
import { NextResponse } from "next/server";

// مفتاح API المسموح للمرسل
const API_KEY = "ALWADI-OTP-771176611";

// مدة الحفظ: شهر كامل
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    // =====================================================
    // حماية الإرسال فقط
    // =====================================================

    const apiKey = request.headers.get("x-api-key");

    if (apiKey !== API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // =====================================================
    // قراءة الطلب
    // =====================================================

    const body = await request.json();

    const { phone, message } = body;

    if (!phone || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "phone and message are required",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // إنشاء الرسالة في Firestore
    // =====================================================

    const db = getDb();
    const now = Date.now();
    const expiresAt = now + ONE_MONTH_MS;

    const docRef = await db.collection("messages").add({
      phone: String(phone),
      message: String(message),
      createdAt: now,
      expiresAt,
      status: "pending",
      deliveredAt: null,
    });

    const data = {
      id: docRef.id,
      phone: String(phone),
      message: String(message),
      createdAt: now,
      status: "pending",
    };

    // إشعار الذاكرة المؤقتة بوجود رسالة جديدة
    notifyNewMessage();

    // =====================================================
    // نجاح
    // =====================================================

    return NextResponse.json({
      success: true,
      message: "Message received",
      data,
    });
  } catch (error) {
    console.error("MESSAGE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}