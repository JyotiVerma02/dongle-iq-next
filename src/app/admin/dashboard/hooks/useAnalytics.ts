/**
 * Lightweight in-app event analytics stub.
 * Stores events in sessionStorage under "diq_analytics" and logs to console in dev.
 * Easily swappable for a real provider (Mixpanel, PostHog, etc.).
 */

interface AnalyticsEvent {
  name: string;
  props?: Record<string, unknown>;
  ts: number;
}

function getStoredEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem("diq_analytics");
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

function storeEvent(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  try {
    const events = getStoredEvents();
    events.push(event);
    // Keep only last 200 events to avoid storage bloat
    sessionStorage.setItem("diq_analytics", JSON.stringify(events.slice(-200)));
  } catch {
    // Ignore storage errors gracefully
  }
}

export function useAnalytics() {
  const trackEvent = (name: string, props?: Record<string, unknown>) => {
    const event: AnalyticsEvent = { name, props, ts: Date.now() };
    storeEvent(event);
    if (process.env.NODE_ENV === "development") {
      console.info("[Analytics]", name, props ?? "");
    }
  };

  return { trackEvent };
}
