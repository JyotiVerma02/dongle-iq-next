import { NextRequest } from "next/server";
import { verifySessionToken, isAdminTokenPayload } from "@/lib/auth";
import { clients, RealtimeClient } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let userId: string | undefined;
  let isAdmin = false;

  const token = req.cookies.get("token")?.value;
  if (token) {
    try {
      const decoded = await verifySessionToken(token);
      userId = String(decoded.userId);
      isAdmin = isAdminTokenPayload(decoded);
    } catch {
      // Allow unauthenticated SSE or just ignore
    }
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const intervalId = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "HEARTBEAT" })}\n\n`)
          );
        } catch {
          clearInterval(intervalId);
          clients.delete(controller);
          try { controller.close(); } catch { /* ignore */ }
        }
      }, 15000);

      const clientInfo: RealtimeClient = {
        controller,
        userId: userId || "anonymous",
        isAdmin,
      };
      
      clients.set(controller, clientInfo);

      // Send initial heartbeat connection event
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "CONNECTED" })}\n\n`)
      );

      req.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        clients.delete(controller);
      });
    },
    cancel() {
      // Fallback for stream cancellation
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
