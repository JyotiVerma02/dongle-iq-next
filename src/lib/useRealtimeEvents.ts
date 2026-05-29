"use client";

import { useEffect } from "react";

export type RealtimeEventPayload = {
  type: string;
  userId?: string;
  ticketId?: string;
  [key: string]: unknown;
};

export function useRealtimeEvents(
  onEvent: (event: RealtimeEventPayload) => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const source = new EventSource("/api/realtime");

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as RealtimeEventPayload;
        if (payload.type && payload.type !== "CONNECTED") {
          onEvent(payload);
        }
      } catch {
        // Ignore malformed events.
      }
    };

    return () => {
      source.close();
    };
  }, [enabled, onEvent]);
}
