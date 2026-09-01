import { getDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { pushUpdateToDashboards } from "@/lib/server-state";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Missing id or status" }, { status: 400 });
    }

    if (status !== "delivered" && status !== "failed") {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const db = getDb();
    const now = Date.now();
    const updateData: any = { status };
    if (status === "delivered") {
      updateData.deliveredAt = now;
    }

    await db.collection("messages").doc(id).update(updateData);

    // تحديث اللوحة بالمعلومة الجديدة
    pushUpdateToDashboards({
      type: "MESSAGE_UPDATED",
      message: { id, status, deliveredAt: updateData.deliveredAt }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("STATUS UPDATE ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
