import { NextRequest } from "next/server";

// In-memory set of active event stream controllers
const clients = new Set<ReadableStreamDefaultController>();

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);

      // Send initial heartbeat connection event
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "CONNECTED" })}\n\n`)
      );

      req.signal.addEventListener("abort", () => {
        clients.delete(controller);
      });
    },
    cancel() {
      // Stream canceled by client
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

/**
 * Broadcast an event to all connected clients.
 */
export function broadcastRealtimeEvent(type: string, data: Record<string, unknown>) {
  const encoder = new TextEncoder();
  const payload = `data: ${JSON.stringify({ type, ...data })}\n\n`;
  const encodedPayload = encoder.encode(payload);

  console.log("[realtime:broadcast]", { type, data, clientCount: clients.size });

  for (const client of clients) {
    try {
      client.enqueue(encodedPayload);
    } catch {
      clients.delete(client);
    }
  }
}
