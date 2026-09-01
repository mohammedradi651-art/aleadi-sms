import { NextResponse } from "next/server";
import { serverState, notifyDashboardsReaderStatus } from "@/lib/server-state";

// Force Node.js Edge runtime to prevent serverless timeouts where possible
export const runtime = "nodejs"; // Or "edge" if preferred, Node is safer for Sets
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Register this reader connection
      serverState.readerStreams.add(controller);
      
      // Notify dashboards that a reader has connected
      notifyDashboardsReaderStatus();

      // Send initial connection success message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "CONNECTED" })}\n\n`));

      // Handle connection close
      request.signal.addEventListener("abort", () => {
        serverState.readerStreams.delete(controller);
        notifyDashboardsReaderStatus();
        try {
          controller.close();
        } catch (e) {}
      });

      // Keep-alive interval (prevents Vercel/proxies from closing idle connections)
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`:\n\n`)); // SSE comment acts as heartbeat
        } catch (e) {
          clearInterval(keepAliveInterval);
          serverState.readerStreams.delete(controller);
          notifyDashboardsReaderStatus();
        }
      }, 15000);

      request.signal.addEventListener("abort", () => {
        clearInterval(keepAliveInterval);
      });
    },
    cancel() {
      // Optional: Cleanup if stream is cancelled by the system
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disables Nginx buffering
    },
  });
}
