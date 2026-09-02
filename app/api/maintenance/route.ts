import { NextResponse } from "next/server";
import { isMaintenanceMode, setMaintenanceMode } from "@/lib/server-state";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ maintenanceMode: await isMaintenanceMode() });
}

export async function POST(request: Request) {
  try {
    const { mode } = await request.json();
    await setMaintenanceMode(mode);
    return NextResponse.json({ success: true, maintenanceMode: mode });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
