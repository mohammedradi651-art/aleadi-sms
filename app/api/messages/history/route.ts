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

const SEVEN_MINUTES = 7 * 60 * 1000;
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    const ids = await redis.lrange<string[]>(
      "messages:history",
      0,
      99,
    );

    const now = Date.now();
    const validMessages: Message[] = [];

    for (const id of ids) {
      const message = await redis.get<Message>(
        `message:${id}`,
      );

      // الرسالة غير موجودة في Redis
      if (!message) {
        continue;
      }

      const age = now - message.createdAt;

      // حذف بعد 24 ساعة
      if (age >= TWENTY_FOUR_HOURS) {
        await redis.del(`message:${id}`);
        continue;
      }

      // pending أكثر من 7 دقائق
      if (
        message.status === "pending" &&
        age >= SEVEN_MINUTES
      ) {
        await redis.del(`message:${id}`);
        await redis.lrem(
          "messages:pending",
          0,
          id,
        );
        continue;
      }

      validMessages.push(message);
    }

    const pending = validMessages.filter(
      (message) => message.status === "pending",
    ).length;

    const delivered = validMessages.filter(
      (message) => message.status === "delivered",
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
      { status: 500 },
    );
  }
}