import { NextResponse } from "next/server";
import { isMaintenanceMode, setMaintenanceMode } from "@/lib/server-state";

export async function GET() {
  return NextResponse.json({ maintenanceMode: isMaintenanceMode() });
}

export async function POST(request: Request) {
  try {
    const { mode } = await request.json();
    setMaintenanceMode(mode);
    return NextResponse.json({ success: true, maintenanceMode: mode });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
