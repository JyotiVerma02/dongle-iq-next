import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** Maximum retry attempts before showing a hard-refresh prompt (default: 3) */
  maxRetries?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

/**
 * Catches rendering errors in its subtree and provides a styled fallback
 * with retry logic. After maxRetries attempts, shows a hard-refresh prompt.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught rendering error:", error);
    if (process.env.NODE_ENV === "development") {
      console.debug("[ErrorBoundary] Component stack:", errorInfo.componentStack);
    }
  }

  private handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  public render() {
    const { hasError, error, retryCount } = this.state;
    const maxRetries = this.props.maxRetries ?? 3;

    if (hasError) {
      if (this.props.fallback) return this.props.fallback;

      const exhausted = retryCount >= maxRetries;

      return (
        <div
          data-testid="error-boundary-fallback"
          className="flex flex-col items-center justify-center p-8 rounded-xl border text-center my-6 space-y-4 max-w-lg mx-auto"
          style={{
            borderColor: "rgba(239, 68, 68, 0.2)",
            backgroundColor: "rgba(239, 68, 68, 0.05)",
          }}
        >
          {/* Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>

          {/* Message */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-red-500">
              {exhausted ? "Something went wrong" : "Component Crashed"}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {exhausted
                ? "Multiple retries failed. Please refresh the page to continue."
                : (error?.message ?? "An unexpected error occurred in this section of the dashboard.")}
            </p>
            {!exhausted && retryCount > 0 && (
              <p className="mt-1 text-[10px] font-semibold text-orange-400">
                Retry attempt {retryCount} of {maxRetries}
              </p>
            )}
          </div>

          {/* Action */}
          {exhausted ? (
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-red-600 active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh Page
            </button>
          ) : (
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-red-600 active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
