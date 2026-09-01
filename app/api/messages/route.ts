import { getDb } from "@/lib/firebase-admin";
import { isReaderConnected, pushMessageToReaders, pushUpdateToDashboards, MessageType } from "@/lib/server-state";
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
    // إنشاء الرسالة في Firestore ودفعها عبر SSE إن أمكن
    // =====================================================

    const db = getDb();
    const now = Date.now();
    const expiresAt = now + ONE_MONTH_MS;

    const readerConnected = isReaderConnected();
    const status = "pending";
    const deliveredAt = null;

    const docRef = await db.collection("messages").add({
      phone: String(phone),
      message: String(message),
      createdAt: now,
      expiresAt,
      status,
      deliveredAt,
    });

    const data: MessageType = {
      id: docRef.id,
      phone: String(phone),
      message: String(message),
      createdAt: now,
      status,
      deliveredAt: deliveredAt ?? undefined,
    };

    // دفع مباشر للقارئ عبر SSE
    if (readerConnected) {
      pushMessageToReaders({ ...data, type: "NEW_MESSAGE" } as any);
    }
    
    // إشعار اللوحة بالرسالة الجديدة
    pushUpdateToDashboards({ type: "NEW_MESSAGE", message: data });

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