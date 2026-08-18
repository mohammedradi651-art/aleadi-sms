import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: Request) {
  try {
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

    const id = crypto.randomUUID();
    const now = Date.now();

    const data = {
      id,
      phone: String(phone),
      message: String(message),
      createdAt: now,
      status: "pending",
    };

    // حفظ الرسالة
    // تنتهي تلقائياً بعد 24 ساعة
    await redis.set(`message:${id}`, data, {
      ex: 60 * 60 * 24,
    });

    // قائمة انتظار القارئ
    await redis.lpush("messages:pending", id);

    // سجل الرسائل
    await redis.lpush("messages:history", id);

    // الاحتفاظ بآخر 100 رسالة فقط
    await redis.ltrim("messages:history", 0, 99);

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