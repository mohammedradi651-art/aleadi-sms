import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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
    // جلب آخر 100 ID من السجل
    const ids = await redis.lrange<string[]>(
      "messages:history",
      0,
      99
    );

    // جلب بيانات كل رسالة
    const messages = await Promise.all(
      ids.map(async (id) => {
        return await redis.get<Message>(`message:${id}`);
      })
    );

    // إزالة أي رسائل غير موجودة
    const validMessages = messages.filter(
      (message): message is Message => message !== null
    );

    const pending = validMessages.filter(
      (message) => message.status === "pending"
    ).length;

    const delivered = validMessages.filter(
      (message) => message.status === "delivered"
    ).length;

    return NextResponse.json({
      success: true,

      stats: {
        total: validMessages.length,
        pending,
        delivered,
      },

      messages: validMessages,
    });

  } catch (error) {
    console.error("HISTORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}