import { NextResponse } from "next/server";
import { serverState, isReaderConnected } from "@/lib/server-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Register dashboard connection
      serverState.dashboardStreams.add(controller);

      // Send initial reader connection status immediately
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "READER_STATUS", connected: isReaderConnected() })}\n\n`)
      );

      // Handle disconnect
      request.signal.addEventListener("abort", () => {
        serverState.dashboardStreams.delete(controller);
        try {
          controller.close();
        } catch (e) {}
      });

      // Keep-alive heartbeat
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`:\n\n`));
        } catch (e) {
          clearInterval(keepAliveInterval);
          serverState.dashboardStreams.delete(controller);
        }
      }, 15000);

      request.signal.addEventListener("abort", () => {
        clearInterval(keepAliveInterval);
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
