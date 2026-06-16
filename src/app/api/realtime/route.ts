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
    } catch {}
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 🔥 register client
      const clientInfo: RealtimeClient = {
        controller,
        userId: userId || "anonymous",
        isAdmin,
      };

      clients.set(controller, clientInfo);

      // 🔥 immediate connect event
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "CONNECTED" })}\n\n`)
      );

      // 🔥 heartbeat (keep alive)
      const intervalId = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "HEARTBEAT" })}\n\n`)
          );
        } catch {
          cleanup();
        }
      }, 10000);

      const cleanup = () => {
        clearInterval(intervalId);
        clients.delete(controller);
        try {
          controller.close();
        } catch {}
      };

      req.signal.addEventListener("abort", cleanup);
    },

    cancel() {
      // fallback cleanup not enough alone → handled above
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // 🔥 important fix
    },
  });
}