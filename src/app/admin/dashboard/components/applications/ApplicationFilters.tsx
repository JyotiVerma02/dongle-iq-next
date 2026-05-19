import { Search, Filter, RotateCcw, Save } from "lucide-react";

interface ApplicationFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  serviceFilter: string;
  setServiceFilter: (val: string) => void;
  paymentFilter: string;
  setPaymentFilter: (val: string) => void;
}

export function ApplicationFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  serviceFilter,
  setServiceFilter,
  paymentFilter,
  setPaymentFilter,
}: ApplicationFiltersProps) {
  
  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setServiceFilter("all");
    setPaymentFilter("all");
  };

  return (
    <div className="border-b border-[var(--border-soft)] p-4 sm:p-6 mb-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)] flex items-center">
          <Filter className="mr-2 h-3 w-3" />
          ADVANCED FILTERS
        </h3>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-[var(--muted)]" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border border-[var(--border-soft)] bg-[var(--background-alt)] py-2 pl-10 text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-xs font-semibold placeholder:text-[var(--muted)]"
            placeholder="SEARCH NAME, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full rounded-xl border border-[var(--border-soft)] bg-[var(--background-alt)] py-2 pl-3 pr-10 text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[10px] font-black uppercase tracking-wider"
        >
          <option value="all">Status: All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="issued">Issued</option>
        </select>

        {/* Service Filter */}
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="block w-full rounded-xl border border-[var(--border-soft)] bg-[var(--background-alt)] py-2 pl-3 pr-10 text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[10px] font-black uppercase tracking-wider"
        >
          <option value="all">Service: All</option>
          <option value="dsc">DSC Class</option>
          <option value="token">Token</option>
          <option value="assisted">Assisted</option>
        </select>

        {/* Payment Filter */}
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="block w-full rounded-xl border border-[var(--border-soft)] bg-[var(--background-alt)] py-2 pl-3 pr-10 text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[10px] font-black uppercase tracking-wider"
        >
          <option value="all">Payment: All</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>
      
      <div className="mt-4 flex justify-end space-x-3">
        <button
          onClick={handleReset}
          className="theme-transition inline-flex items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--card)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--foreground)] hover:bg-[var(--background-alt)]"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
        <button
          className="theme-primary-btn theme-transition inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white"
        >
          <Save className="h-3 w-3" />
          Save Filter
        </button>
      </div>
    </div>
  );
}
