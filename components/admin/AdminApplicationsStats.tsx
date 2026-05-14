"use client";

type AdminApplicationsStatsProps = {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    issued: number;
  };
  colors: Record<string, string>;
};

export default function AdminApplicationsStats({ stats, colors }: AdminApplicationsStatsProps) {
  const cards = [
    { label: "Total Applicants", value: stats.total, tone: "var(--accent)" },
    { label: "Issued DSCs", value: stats.issued, tone: "#2563eb" },
    { label: "Pending", value: stats.pending, tone: "#d97706" },
    { label: "Rejected", value: stats.rejected, tone: "#e11d48" },
  ];

  return (
    <section className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="admin-compact-panel rounded-lg px-4 py-4 transition duration-200 hover:-translate-y-0.5"
        >
          <p
            className="text-[10px] font-black uppercase tracking-[0.18em]"
            style={{ color: colors.subtleText }}
          >
            {card.label}
          </p>
          <p className="mt-3 text-2xl font-black" style={{ color: card.tone }}>
            {card.value}
          </p>
        </div>
      ))}
    </section>
  );
}
