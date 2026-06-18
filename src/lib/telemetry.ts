/**
 * Dongle IQ Telemetry & Monitoring Client (Weeks 6.3 - 6.6)
 * Supports Sentry, Google Analytics, Performance Tracking, and Session Recording.
 */

export type AnalyticsEvent = {
  name: string;
  category?: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
};

class TelemetryService {
  private isDev = process.env.NODE_ENV !== "production";
  private sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || "";
  private analyticsId = process.env.NEXT_PUBLIC_GA_ID || "";
  private logrocketId = process.env.NEXT_PUBLIC_LOGROCKET_ID || "";
  private globalListenersAttached = false;

  constructor() {
    this.attachGlobalErrorHandlers();
    this.initSessionRecording();
  }

  /**
   * 6.3 Error tracking (Sentry wrapper)
   */
  captureError(error: Error | string, context?: Record<string, any>) {
    const errorObject = typeof error === "string" ? new Error(error) : error;

    if (this.isDev) {
      console.group("⚠️ [Telemetry Error]");
      console.error(errorObject);
      if (context) console.log("Context:", context);
      console.groupEnd();
      return;
    }

    // Production: If Sentry is installed on window, capture it
    const windowWithSentry = window as any;
    if (windowWithSentry.Sentry) {
      windowWithSentry.Sentry.captureException(errorObject, { extra: context });
    }
  }

  /**
   * 6.4 Performance Monitoring (render times, API latency)
   */
  trackPerformance(metricName: string, durationMs: number, metadata?: Record<string, any>) {
    if (this.isDev) {
      console.log(
        `⚡ [Performance] ${metricName}: \x1b[33m${durationMs.toFixed(2)}ms\x1b[0m`,
        metadata || ""
      );
      return;
    }

    // Send to Google Analytics or Sentry performance monitoring
    this.trackEvent({
      name: "performance_metric",
      category: "Performance",
      label: metricName,
      value: Math.round(durationMs),
      metadata
    });
  }

  /**
   * 6.5 Analytics events tracking for core actions
   */
  trackEvent(event: AnalyticsEvent) {
    if (this.isDev) {
      console.log(`📊 [Analytics Event] "${event.name}"`, event);
      return;
    }

    // Google Analytics (gtag) integration
    const windowWithGtag = window as any;
    if (windowWithGtag.gtag) {
      windowWithGtag.gtag("event", event.name, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.metadata
      });
    }
  }

  /**
   * 6.6 Session recording hooks setup (LogRocket / Hotjar)
   */
  private initSessionRecording() {
    if (typeof window === "undefined" || this.isDev) {
      return;
    }

    if (this.logrocketId) {
      console.log("[Telemetry] Initializing LogRocket session recording...");
      // Dynamically load LogRocket client-side to keep bundle small
      // @ts-ignore
      import("logrocket").then((LogRocket) => {
        LogRocket.default.init(this.logrocketId);
      }).catch((err) => {
        console.error("Failed to load LogRocket:", err);
      });
    }
  }

  private attachGlobalErrorHandlers() {
    if (typeof window === "undefined" || this.globalListenersAttached) {
      return;
    }

    this.globalListenersAttached = true;

    window.addEventListener("error", (event) => {
      if (event.error) {
        this.captureError(event.error as Error, {
          source: "window:error",
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      }
    });

    window.addEventListener("unhandledrejection", (event) => {
      const reason =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason || "Unhandled promise rejection"));

      this.captureError(reason, {
        source: "window:unhandledrejection",
      });
    });
  }

  /**
   * Identify user inside telemetry tools
   */
  identify(userId: string, traits?: Record<string, any>) {
    if (this.isDev) {
      console.log(`👤 [Telemetry Identify] User: ${userId}`, traits || "");
      return;
    }

    const windowWithSentry = window as any;
    if (windowWithSentry.Sentry) {
      windowWithSentry.Sentry.setUser({ id: userId, ...traits });
    }

    const windowWithGtag = window as any;
    if (windowWithGtag.gtag && traits?.email) {
      windowWithGtag.gtag("set", "user_properties", {
        user_id: userId,
        email: traits.email
      });
    }
  }
}

export const telemetry = new TelemetryService();
