export type RealtimeClient = {
  controller: ReadableStreamDefaultController;
  userId?: string;
  isAdmin: boolean;
};

// In-memory map of active event stream controllers
export const clients = new Map<ReadableStreamDefaultController, RealtimeClient>();

export type TargetAudience = {
  recipientType: "ADMIN" | "USER";
  userId?: string;
};

/**
 * Broadcast an event to targeted clients.
 */
export function broadcastRealtimeEvent(
  type: string,
  data: Record<string, unknown>,
  target?: TargetAudience
) {
  const encoder = new TextEncoder();
  const payload = `data: ${JSON.stringify({ type, ...data })}\n\n`;
  const encodedPayload = encoder.encode(payload);

  if (process.env.NODE_ENV !== "production") {
    console.log("[realtime:broadcast]", { type, target, data, totalClients: clients.size });
  }

  for (const [controller, client] of clients.entries()) {
    try {
      let shouldSend = true;

      if (target) {
        if (target.recipientType === "ADMIN") {
          shouldSend = client.isAdmin;
        } else if (target.recipientType === "USER") {
          shouldSend = !client.isAdmin && client.userId === target.userId;
        }
      }

      if (shouldSend) {
        controller.enqueue(encodedPayload);
      }
    } catch {
      clients.delete(controller);
    }
  }
}
