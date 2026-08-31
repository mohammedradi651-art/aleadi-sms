import { getDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const db = getDb();
    
    // We assume there's one main reader app.
    // If the reader sends a specific device ID, we could use it, 
    // but for now we just use a fixed "main-reader" document.
    const deviceId = "main-reader";

    await db.collection("system").doc(deviceId).set({
      lastSeen: Date.now(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("HEARTBEAT ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
