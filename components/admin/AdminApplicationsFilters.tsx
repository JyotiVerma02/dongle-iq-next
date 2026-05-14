"use client";

import { Download, FileSpreadsheet, Search } from "lucide-react";
import { FilterSelect, capitalizeValue } from "@/components/admin/utils/adminApplicationsHelpers";

type AdminApplicationsFiltersProps = {
  searchInput: string;
  statusFilter: string;
  validityFilter: string;
  certTypeFilter: string;
  filterOptions: {
    certTypes: string[];
    validities: string[];
  };
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onValidityFilterChange: (value: string) => void;
  onCertTypeFilterChange: (value: string) => void;
  onExport: (format: "csv" | "excel") => void;
  colors: Record<string, string>;
  isDarkMode: boolean;
};

export default function AdminApplicationsFilters({
  searchInput,
  statusFilter,
  validityFilter,
  certTypeFilter,
  filterOptions,
  onSearchChange,
  onStatusFilterChange,
  onValidityFilterChange,
  onCertTypeFilterChange,
  onExport,
  colors,
  isDarkMode,
}: AdminApplicationsFiltersProps) {
  return (
    <div
      className="sticky top-0 z-10 -mx-3 mb-4 border-b px-3 pb-3 pt-0 backdrop-blur sm:-mx-4 sm:px-4"
      style={{
        borderColor: colors.borderSoft,
        backgroundColor: isDarkMode
          ? "rgba(10,19,30,0.78)"
          : "rgba(255,255,255,0.82)",
      }}
    >
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,0.75fr))]">
        <div className="relative min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2"
            size={15}
            style={{ color: colors.muted }}
          />
          <input
            type="text"
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name, email, mobile, PAN or DSC ID"
            className="h-11 w-full rounded-lg border bg-transparent pl-9 pr-3 text-sm outline-none"
            style={{
              borderColor: colors.borderSoft,
              backgroundColor: colors.panel,
              color: colors.text,
            }}
          />
        </div>

        <FilterSelect
          value={statusFilter}
          onChange={onStatusFilterChange}
          options={STATUS_OPTIONS.map((value) => ({
            label: capitalizeValue(value),
            value,
          }))}
          colors={colors}
        />
        <FilterSelect
          value={validityFilter}
          onChange={onValidityFilterChange}
          options={[
            { label: "All Validities", value: "all" },
            ...filterOptions.validities.map((value) => ({
              label: value,
              value,
            })),
          ]}
          colors={colors}
        />
        <FilterSelect
          value={certTypeFilter}
          onChange={onCertTypeFilterChange}
          options={[
            { label: "All Certificate Types", value: "all" },
            ...filterOptions.certTypes.map((value) => ({
              label: value,
              value,
            })),
          ]}
          colors={colors}
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onExport("csv")}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-bold uppercase tracking-[0.12em]"
            style={{
              borderColor: colors.borderSoft,
              backgroundColor: colors.panel,
              color: colors.text,
            }}
          >
            <Download size={14} />
            CSV
          </button>
          <button
            type="button"
            onClick={() => onExport("excel")}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-bold uppercase tracking-[0.12em]"
            style={{
              borderColor: colors.borderSoft,
              backgroundColor: colors.panel,
              color: colors.text,
            }}
          >
            <FileSpreadsheet size={14} />
            Excel
          </button>
        </div>
      </div>
    </div>
  );
}

const STATUS_OPTIONS = [
  "all",
  "pending",
  "approved",
  "rejected",
  "issued",
] as const;
