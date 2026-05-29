"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquare, RefreshCw, Send, TicketCheck } from "lucide-react";
import toast from "react-hot-toast";

import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

type TicketMessage = {
  senderType: "user" | "admin" | "system";
  senderId?: string;
  senderName?: string;
  message: string;
  createdAt?: string;
};

type SupportTicket = {
  _id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
  adminNotes?: string;
  assignedTo?: string;
  messages?: TicketMessage[];
  userId?: {
    _id?: string;
    name?: string;
    email?: string;
    number?: string;
    status?: string;
    certType?: string;
  };
};

type SupportResponse = {
  success: boolean;
  tickets: SupportTicket[];
  pagination?: {
    page: number;
    pages: number;
    total: number;
  };
  stats?: {
    open: number;
    inProgress: number;
    resolved: number;
  };
};

function formatDate(value?: string) {
  if (!value) return "Just now";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusTone(status: string) {
  switch (status) {
    case "resolved":
    case "closed":
      return "text-emerald-500";
    case "in_progress":
      return "text-sky-500";
    case "waiting_on_user":
      return "text-amber-500";
    default:
      return "text-rose-500";
  }
}

export function SupportTicketsView() {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("open");

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket._id === selectedTicketId) || tickets[0] || null,
    [selectedTicketId, tickets],
  );

  const loadTickets = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await fetch("/api/admin/support-tickets", { cache: "no-store" });
      const data = (await response.json()) as SupportResponse;

      if (!response.ok || !data.success) {
        throw new Error("Failed to load support tickets");
      }

      setTickets(data.tickets || []);
      setSelectedTicketId((current) => current || data.tickets?.[0]?._id || "");
      setStatus((current) => current || data.tickets?.[0]?.status || "open");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load support tickets");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      setStatus(selectedTicket.status);
    }
  }, [selectedTicket?._id]);

  const handleSendReply = async () => {
    if (!selectedTicket || !reply.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/support-tickets/${selectedTicket._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket._id,
          message: reply.trim(),
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update ticket");
      }

      setReply("");
      await loadTickets(false);
      toast.success("Reply sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send reply");
    }
  };

  if (loading) {
    return (
      <div
        className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-6"
        style={{
          borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#ffffff",
        }}
      >
        <div className="h-8 w-40 animate-pulse rounded bg-[var(--skeleton)]" />
        <div className="mt-4 grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="h-[520px] animate-pulse rounded-xl bg-[var(--skeleton)]" />
          <div className="h-[520px] animate-pulse rounded-xl bg-[var(--skeleton)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">
            Support Tickets
          </h2>
          <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
            Admin-user conversation thread with ticket status management.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadTickets(false)}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em]"
          style={{
            borderColor: colors.borderSoft,
            backgroundColor: colors.card,
            color: colors.text,
          }}
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div
          className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border"
          style={{
            borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#ffffff",
          }}
        >
          <div className="border-b border-[var(--border-soft)] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">
              Queue
            </p>
          </div>
          <div className="max-h-[680px] overflow-y-auto p-3">
            {tickets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border-soft)] p-6 text-center text-sm text-[var(--muted)]">
                No support tickets yet.
              </div>
            ) : (
              <div className="space-y-2">
                {tickets.map((ticket) => {
                  const isSelected = ticket._id === selectedTicket?._id;
                  return (
                    <button
                      key={ticket._id}
                      type="button"
                      onClick={() => setSelectedTicketId(ticket._id)}
                      className="w-full rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5"
                      style={{
                        borderColor: isSelected ? colors.accent : colors.borderSoft,
                        backgroundColor: isSelected ? colors.accentSoft : colors.panelStrong,
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-black uppercase tracking-[0.18em]">
                          {ticket.subject}
                        </p>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${getStatusTone(ticket.status)}`}>
                          {ticket.status.replaceAll("_", " ")}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-[var(--muted)]">
                        {ticket.userId?.name || "Customer"} · {ticket.category} · {ticket.priority}
                      </p>
                      <p className="mt-1 text-[10px] text-[var(--subtle-text)]">
                        {formatDate(ticket.lastMessageAt || ticket.updatedAt)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div
          className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border"
          style={{
            borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#ffffff",
          }}
        >
          {selectedTicket ? (
            <>
              <div className="flex flex-col gap-3 border-b border-[var(--border-soft)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">
                    Ticket Detail
                  </p>
                  <h3 className="mt-1 text-base font-black uppercase tracking-tight text-[var(--foreground)]">
                    {selectedTicket.subject}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                    {selectedTicket.userId?.name || "Customer"} · {selectedTicket.userId?.email || "Email not available"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em]"
                    style={{
                      borderColor: colors.borderSoft,
                      backgroundColor: colors.card,
                      color: colors.text,
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_on_user">Waiting on User</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="max-h-[470px] overflow-y-auto p-4">
                <div className="space-y-3">
                  {(selectedTicket.messages || []).map((message, index) => {
                    const isAdmin = message.senderType === "admin";
                    return (
                      <div key={`${message.senderType}-${index}`} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm leading-6 ${
                            isAdmin
                              ? "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200"
                              : "border-[var(--border-soft)] bg-[var(--background-alt)] text-[var(--foreground)]"
                          }`}
                        >
                          <div className="mb-1 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.18em] opacity-80">
                            <span>{message.senderName || message.senderType}</span>
                            <span>{formatDate(message.createdAt)}</span>
                          </div>
                          <p>{message.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-[var(--border-soft)] p-4">
                <label className="block">
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">
                    Reply message
                  </span>
                  <textarea
                    rows={4}
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Write a reply for the applicant..."
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{
                      borderColor: colors.borderSoft,
                      backgroundColor: colors.panelStrong,
                      color: colors.text,
                    }}
                  />
                </label>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: colors.muted }}>
                    <TicketCheck size={14} />
                    {selectedTicket.assignedTo || "Unassigned"}
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleSendReply()}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white"
                    style={{ background: colors.accent }}
                  >
                    <Send size={12} />
                    Send reply
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[520px] items-center justify-center p-8 text-center text-sm text-[var(--muted)]">
              Select a ticket to view the conversation thread.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
