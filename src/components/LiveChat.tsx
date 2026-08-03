"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  LoaderCircle,
  MessageSquare,
  Send,
  X,
} from "lucide-react";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

type ChatRole = "user" | "support";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

type LiveChatProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  storageKey?: string;
  initialMessages?: ChatMessage[];
  onSendMessage?: (message: string, history: ChatMessage[]) => Promise<string>;
};

const DEFAULT_STORAGE_KEY = "dongleiq-live-chat";

const starterMessage: ChatMessage = {
  id: "support-welcome",
  role: "support",
  content:
    "Hi, welcome to DongleIQ support. Tell us what you need help with and we will guide you through the next step.",
  createdAt: Date.now(),
};

function createReply(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("dsc") || normalized.includes("digital signature")) {
    return "For DSC help, we usually start with the certificate type, validity, and document checklist. Share what stage you are at and I will guide you from there.";
  }

  if (normalized.includes("irctc")) {
    return "For IRCTC onboarding, support usually checks your registration stage, ID status, and any pending verification details. Tell me which part is blocking you.";
  }

  if (
    normalized.includes("document") ||
    normalized.includes("upload") ||
    normalized.includes("file")
  ) {
    return "If documents are the issue, I can help you confirm the required proof types and the cleanest way to upload them without rejection.";
  }

  if (
    normalized.includes("price") ||
    normalized.includes("cost") ||
    normalized.includes("quote")
  ) {
    return "For pricing or quote requests, support usually confirms your service type, validity, token choice, and whether assisted service is needed.";
  }

  return "Thanks for sharing that. A support specialist would usually confirm your service type, verification stage, and any error you are seeing before guiding the next step.";
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function LiveChat({
  open,
  onClose,
  title = "Live Support",
  storageKey = DEFAULT_STORAGE_KEY,
  initialMessages,
  onSendMessage,
}: LiveChatProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open && initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
      return;
    }

    try {
      const saved = window.sessionStorage.getItem(storageKey);

      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved) as ChatMessage[];

      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed);
      } else {
        setMessages([starterMessage]);
      }
    } catch {
      setMessages([starterMessage]);
    }
  }, [initialMessages, open, storageKey]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (messages.length > 0) {
      window.sessionStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const messageCountLabel = useMemo(
    () =>
      `${messages.length} ${messages.length === 1 ? "message" : "messages"}`,
    [messages.length],
  );

  const sendMessage = async () => {
    const nextMessage = input.trim();

    if (!nextMessage || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: nextMessage,
      createdAt: Date.now(),
    };

    const nextHistory = [...messages, userMessage];

    setMessages(nextHistory);
    setInput("");
    setIsSending(true);

    try {
      const replyText = onSendMessage
        ? await onSendMessage(nextMessage, nextHistory)
        : await (async () => {
            await wait(1100 + Math.floor(Math.random() * 500));
            return createReply(nextMessage);
          })();

      const supportMessage: ChatMessage = {
        id: `support-${Date.now()}`,
        role: "support",
        content: replyText,
        createdAt: Date.now(),
      };

      setMessages((current) => [...current, supportMessage]);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="live-chat-backdrop fixed inset-0 z-[10000] flex items-end justify-end p-0 sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        className="live-chat-panel relative z-[10001] flex h-dvh w-full flex-col overflow-hidden border text-[var(--foreground)] shadow-[0_28px_80px_-30px_rgba(0,0,0,0.6)] sm:h-[min(34rem,calc(100dvh-3rem))] sm:w-[24rem] sm:max-w-[calc(100vw-3rem)] sm:rounded-[1.25rem]"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.text,
        }}
      >
        <div
          className="relative z-[1000] flex items-center justify-between border-b px-4 pb-3.5 pt-[calc(env(safe-area-inset-top)+0.875rem)] sm:pt-3.5"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.borderSoft,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="Go back"
              className="flex h-10 w-10 items-center justify-center rounded-full sm:hidden"
              style={{
                borderColor: colors.borderSoft,
                backgroundColor: colors.panelStrong,
                color: colors.text,
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <div
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: colors.accentSoft,
                color: colors.accent,
              }}
            >
              <MessageSquare size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: colors.text }}>{title}</p>
              <p className="text-xs" style={{ color: colors.muted }}>Online now</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close live chat"
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              borderColor: colors.borderSoft,
              backgroundColor: colors.panelStrong,
              color: colors.text,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="border-b px-4 py-2.5 text-xs"
          style={{
            borderColor: colors.borderSoft,
            color: colors.muted,
            backgroundColor: colors.panel,
          }}
        >
          {messageCountLabel}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-end gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "support" && (
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: colors.accent,
                      color: '#ffffff', // Fixed: Replaced colors.textContrast with explicit white
                    }}
                  >
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-md transition-all duration-300 ${
                    message.role === "user"
                      ? "rounded-br-none"
                      : "border rounded-bl-none"
                  }`}
                  style={{
                    backgroundColor: message.role === "user" ? colors.accent : colors.panel,
                    borderColor: colors.borderSoft, // Keep existing border color
                    color: message.role === "user" ? '#ffffff' : colors.text, // Fixed: Replaced colors.textContrast with explicit white
                  }}
                >
                  {message.content}
                  <p
                    className={`mt-1 text-[10px] text-right ${
                      message.role === "user" ? "text-white/70" : ""
                    }`}
                    style={{ color: message.role === "user" ? "rgba(255,255,255,0.7)" : colors.muted }}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {message.role === "user" && (
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: colors.accent, // Assuming primary is a good user color
                      color: '#ffffff', // Fixed: Replaced colors.textContrast with explicit white
                    }}
                  >
                    U
                  </div>
                )}
              </div>
            ))}

            {isSending ? (
              <div className="flex justify-start">
                <div
                  className="inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-sm"
                  style={{
                    borderColor: colors.borderSoft,
                    backgroundColor: colors.panel,
                    color: colors.muted,
                  }}
                >
                  <LoaderCircle size={14} className="animate-spin" />
                  Support is typing...
                </div>
              </div>
            ) : null}
          </div>

          <div ref={bottomRef} />
        </div>

        <div
          className="border-t p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:pb-4"
          style={{
            borderColor: colors.borderSoft,
            backgroundColor: colors.card,
          }}
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Type your message..."
              className="live-chat-input h-12 flex-1 rounded-2xl border px-4 text-sm outline-none"
              style={{
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
                color: colors.text,
              }}
            />

            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={isSending || !input.trim()}
              className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-[0_16px_34px_-18px_var(--accent-shadow)] disabled:cursor-not-allowed disabled:opacity-55"
              style={{
                backgroundColor: colors.accent,
                color: '#ffffff', // Fixed: Replaced colors.textContrast with explicit white
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
