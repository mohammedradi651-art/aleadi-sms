import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const SEVEN_MINUTES = 7 * 60 * 1000;
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

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
    while (true) {
      const id = await redis.rpop<string>("messages:pending");

      if (!id) {
        return NextResponse.json({
          success: true,
          message: null,
        });
      }

      const message = await redis.get<Message>(
        `message:${id}`,
      );

      // الرسالة غير موجودة
      if (!message) {
        continue;
      }

      const age = Date.now() - message.createdAt;

      // تجاوزت 24 ساعة
      if (age >= TWENTY_FOUR_HOURS) {
        await redis.del(`message:${id}`);
        continue;
      }

      // تجاوزت 7 دقائق بدون سحب
      if (
        message.status === "pending" &&
        age >= SEVEN_MINUTES
      ) {
        await redis.del(`message:${id}`);
        continue;
      }

      // تسليم الرسالة
      const updatedMessage: Message = {
        ...message,
        status: "delivered",
        deliveredAt: Date.now(),
      };

      // تبقى حتى إكمال 24 ساعة من وقت وصولها
      const remainingSeconds = Math.max(
        1,
        Math.ceil(
          (TWENTY_FOUR_HOURS - age) / 1000,
        ),
      );

      await redis.set(
        `message:${id}`,
        updatedMessage,
        {
          ex: remainingSeconds,
        },
      );

      return NextResponse.json({
        success: true,
        message: updatedMessage,
      });
    }
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