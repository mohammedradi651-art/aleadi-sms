import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// مفتاح API المسموح للمرسل
const API_KEY = "ALWADI-OTP-771176611";

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
    // إنشاء الرسالة
    // =====================================================

    const id = crypto.randomUUID();
    const now = Date.now();

    const data = {
      id,
      phone: String(phone),
      message: String(message),
      createdAt: now,
      status: "pending",
    };

    // =====================================================
    // حفظ الرسالة لمدة 24 ساعة
    // =====================================================

    await redis.set(`message:${id}`, data, {
      ex: 60 * 60 * 24,
    });

    // =====================================================
    // قائمة انتظار القارئ
    // =====================================================

    await redis.lpush("messages:pending", id);

    // =====================================================
    // سجل الرسائل للوحة التحكم
    // =====================================================

    await redis.lpush("messages:history", id);

    await redis.ltrim("messages:history", 0, 99);

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