import { useState, useMemo } from "react";
import { User } from "../../types";
import { ApplicationsTable } from "./ApplicationsTable";
import { ApplicationFilters } from "./ApplicationFilters";
import { Pagination } from "../common/Pagination";
import { Download, CheckSquare } from "lucide-react";
import toast from "react-hot-toast";

interface ApplicationsViewProps {
  users: User[];
  onUpdateStatus: (userId: string, status: string) => Promise<boolean>;
}

export function ApplicationsView({ users, onUpdateStatus }: ApplicationsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter Logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.appId?.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesService = serviceFilter === "all" || user.serviceType === serviceFilter;
      const matchesPayment = paymentFilter === "all" || user.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesService && matchesPayment;
    });
  }, [users, searchTerm, statusFilter, serviceFilter, paymentFilter]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const currentUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const handleExport = () => {
    toast.success("Exporting data to CSV...");
    // Mock export functionality
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">
            All Applications
          </h2>
          <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
            Manage and process customer applications.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            className="theme-transition inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--card)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--foreground)] hover:bg-[var(--background-alt)] sm:w-auto"
          >
            <CheckSquare className="h-3 w-3" />
            Bulk Action
          </button>
          <button
            onClick={handleExport}
            className="theme-primary-btn theme-transition inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white sm:w-auto"
          >
            <Download className="h-3 w-3" />
            Export
          </button>
        </div>
      </div>

      <div className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6" style={{ borderColor: "var(--border-soft)" }}>
        <ApplicationFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          serviceFilter={serviceFilter}
          setServiceFilter={setServiceFilter}
          paymentFilter={paymentFilter}
          setPaymentFilter={setPaymentFilter}
        />
        
        <div className="overflow-x-auto">
          <ApplicationsTable 
            users={currentUsers} 
            onUpdateStatus={onUpdateStatus} 
          />
        </div>
        
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}
