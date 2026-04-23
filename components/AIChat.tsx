"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, LoaderCircle, MessageSquare, Send, Sparkles, X } from "lucide-react";

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
        className="relative z-20 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl transition-all hover:scale-105"
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {open ? (
        <div className="mt-3 flex h-[560px] w-[360px] max-w-[95vw] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl">
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3">
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

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-900 p-3">
            {messages.map((msg, i) => (
              <div
                key={`${msg.role}-${i}`}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "user" ? "bg-blue-600 text-white" : "bg-slate-800 text-white"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="flex w-fit items-center gap-2 rounded-xl bg-slate-800 px-3 py-2">
                <LoaderCircle size={14} className="animate-spin" />
                Typing...
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>

          <div className="border-t border-white/10 bg-slate-950 p-3">
            {error ? (
              <p className="mb-2 text-xs font-semibold text-red-400">{error}</p>
            ) : null}

            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleEnter}
                placeholder="Ask anything..."
                className="flex-1 rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm outline-none"
              />

              <button
                onClick={() => void sendMessage()}
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 disabled:opacity-50"
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
                  className="rounded-full border border-white/10 bg-slate-800 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white disabled:opacity-50"
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
