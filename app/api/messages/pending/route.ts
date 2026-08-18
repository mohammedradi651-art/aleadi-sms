import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET() {
  try {
    // أخذ رسالة من قائمة الانتظار
    const id = await redis.rpop<string>("messages:pending");

    if (!id) {
      return NextResponse.json({
        success: true,
        message: null,
      });
    }

    // جلب بيانات الرسالة
    const message = await redis.get<{
      id: string;
      phone: string;
      message: string;
      createdAt: number;
      status: string;
    }>(`message:${id}`);

    if (!message) {
      return NextResponse.json({
        success: true,
        message: null,
      });
    }

    // تغيير حالة الرسالة بدل حذفها
    const updatedMessage = {
      ...message,
      status: "delivered",
      deliveredAt: Date.now(),
    };

    await redis.set(`message:${id}`, updatedMessage);

    return NextResponse.json({
      success: true,
      message: updatedMessage,
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