"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, LoaderCircle, MessageSquare, Send, Sparkles, X } from "lucide-react";

import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

type Msg = {
  role: "user" | "assistant";
  content: string;
};

const starterQuestions = [
  "What documents are required for DSC?",
  "How do I apply for IRCTC agent ID?",
  "Explain digital signature in simple words",
];

export default function AIChat() {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi, welcome to DongleIQ. Ask me about DSC, IRCTC Agent ID, registration, support, or any general question.",
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (preset?: string) => {
    const text = (preset ?? input).trim();

    if (!text || loading) {
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      const data = (await res.json()) as { reply?: string };

      if (!res.ok) {
        throw new Error(data.reply || "Unable to get a reply right now.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Sorry, no response found.",
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Server error. Please try again.";

      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I could not reply right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void sendMessage();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      <button
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Close AI chat" : "Open AI chat"}
        className="relative z-20 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all hover:scale-105"
        style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-light))" }}
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {open ? (
        <div
          className="mt-3 flex h-[min(560px,78vh)] w-[min(360px,95vw)] max-w-[95vw] flex-col overflow-hidden rounded-2xl border text-white shadow-2xl"
          style={{
            borderColor: colors.borderSoft,
            backgroundColor: isDarkMode ? "#08111f" : "#f8fbff",
            color: colors.text,
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-light))" }}
          >
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <div>
                <p className="text-sm font-bold">DongleIQ AI</p>
                <p className="text-[10px] opacity-80">Online now</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1.5 text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div
            className="flex-1 space-y-3 overflow-y-auto p-3"
            style={{ backgroundColor: isDarkMode ? "#0b1526" : "rgba(255,255,255,0.78)" }}
          >
            {messages.map((msg, i) => (
              <div
                key={`${msg.role}-${i}`}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[82%] rounded-2xl px-3 py-2 text-sm"
                  style={{
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, var(--accent), var(--accent-light))"
                        : isDarkMode
                          ? "rgba(148, 163, 184, 0.14)"
                          : "rgba(226, 232, 240, 0.9)",
                    color: msg.role === "user" ? "#ffffff" : colors.text,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading ? (
              <div
                className="flex w-fit items-center gap-2 rounded-xl px-3 py-2"
                style={{
                  backgroundColor: isDarkMode ? "rgba(148, 163, 184, 0.14)" : "rgba(226, 232, 240, 0.9)",
                  color: colors.text,
                }}
              >
                <LoaderCircle size={14} className="animate-spin" />
                Typing...
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>

          <div
            className="border-t p-3"
            style={{
              borderColor: colors.borderSoft,
              backgroundColor: isDarkMode ? "#08111f" : "#f8fbff",
            }}
          >
            {error ? (
              <p className="mb-2 text-xs font-semibold text-red-400">{error}</p>
            ) : null}

            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleEnter}
                placeholder="Ask anything..."
                className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.input,
                  color: colors.text,
                }}
              />

              <button
                onClick={() => void sendMessage()}
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-light))" }}
              >
                <Send size={16} />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {starterQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void sendMessage(question)}
                  disabled={loading}
                  className="rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition disabled:opacity-50"
                  style={{
                    borderColor: colors.accentSoft,
                    background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={12} />
                    {question}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
