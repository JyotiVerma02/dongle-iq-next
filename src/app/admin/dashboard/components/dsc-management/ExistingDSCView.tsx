"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  PlusCircle,
  SunMedium,
  Moon
} from "lucide-react";
import { createPortal } from "react-dom";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";
import toast from "react-hot-toast";
import { Table } from "../common/Table";
import { getDocumentRouteHref } from "@/lib/documentAccess";
import type { AdminProfile } from "../../types";
import { getAdminRoleLabel, hasAdminPermission } from "@/lib/adminRoles";

interface ExistingDSCViewProps {
  onBack: () => void;
  onCreateNew?: () => void;
  admin?: AdminProfile | null;
}

type ApiResponse = {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
};

async function parseApiResponse(response: Response): Promise<ApiResponse> {
  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();

  if (!contentType.includes("application/json")) {
    return {
      success: false,
      message: bodyText.trim()
        ? bodyText.slice(0, 180)
        : `Unexpected response format (${response.status})`,
    };
  }

  try {
    return JSON.parse(bodyText) as ApiResponse;
  } catch {
    return {
      success: false,
      message: "Invalid JSON response from server",
    };
  }
}

interface DSCApplication {
  _id: string;
  dscId: string;
  name: string;
  email: string;
  number?: string; // Mobile
  serviceType: string;
  certificateClass?: string;
  certType?: string;
  validity: string;
  tokenType?: string;
  status: string;
  createdAt: string;
  internalRemarks?: string;
  remarksViewed?: boolean;
  resubmissionDocs?: {
    photo: boolean;
    idProof: boolean;
    addressProof: boolean;
  };
  __v?: number;
  address?: string;
  addressProof?: string;
  bpCode?: string;
  city?: string;
  clientId?: string;
  commission?: number;
  createdBy?: string;
  createdById?: string;
  dob?: string;
  ekycId?: string;
  ekycPin?: string;
  gender?: string;
  gst?: number;
  idProof?: string;
  isAadhaarVerified?: boolean;
  isVerified?: boolean;
  pan?: string;
  paymentStatus?: string;
  photo?: string;
  pincode?: string;
  price?: number;
  role?: string;
  state?: string;
  updatedAt?: string;
  auditTrail?: Array<{
    action: string;
    actorName: string;
    actorEmail: string;
    actorRole: string;
    timestamp: string;
    remarks?: string;
    fromStatus?: string;
    toStatus?: string;
  }>;
}

export function ExistingDSCView({ onBack, onCreateNew, admin }: ExistingDSCViewProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const canManageDetails = hasAdminPermission(admin?.role, "manage_application_details");
  const canReview = hasAdminPermission(admin?.role, "review_application");
  const canDispatch = hasAdminPermission(admin?.role, "dispatch_application");
  const canMarkDelivered = hasAdminPermission(admin?.role, "mark_delivered");
  const canIssue = hasAdminPermission(admin?.role, "issue_application");
  const canDelete = hasAdminPermission(admin?.role, "delete_application");
  const canLeaveInternalNote = hasAdminPermission(admin?.role, "leave_internal_note");
  const canChangeStatus = canReview || canDispatch || canMarkDelivered || canIssue;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const [applications, setApplications] = useState<DSCApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);
  const [totalPages, setTotalPages] = useState(1);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<"edit" | "details" | "docs">("edit");
  const [editingApp, setEditingApp] = useState<DSCApplication | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    certificateClass: "",
    certType: "",
    validity: "",
    tokenType: "",
    status: "",
    reason: "",
  });
  const [resubDocs, setResubDocs] = useState({
    photo: false,
    idProof: false,
    addressProof: false,
  });

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/dsc-applications?page=${currentPage}&search=${searchQuery}`);
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.applications);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error(data.message || "Failed to fetch applications");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchApplications();
  }, [fetchApplications]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      const response = await fetch(`/api/admin/dsc-applications/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Application deleted successfully");
        fetchApplications();
      } else {
        toast.error(data.message || "Failed to delete application");
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("An error occurred.");
    }
  };

  const handleEditClick = (app: DSCApplication) => {
    setEditingApp(app);
    setActiveModalTab("edit");
    
    // Parse internalRemarks if it exists to get reason or other details
    let reason = "";
    if (app.internalRemarks) {
      try {
        const remarks = JSON.parse(app.internalRemarks);
        reason = remarks.reason || "";
      } catch {
        reason = app.internalRemarks; // Fallback to raw string if not JSON
      }
    }

    setEditFormData({
      name: app.name || "",
      email: app.email || "",
      mobile: app.number || "",
      certificateClass: app.certificateClass || "Class 3",
      certType: app.certType || "Signature",
      validity: app.validity || "2 Years",
      tokenType: app.tokenType || "USB Token",
      status: app.status || "pending",
      reason: reason,
    });
    setResubDocs({
      photo: app.resubmissionDocs?.photo || false,
      idProof: app.resubmissionDocs?.idProof || false,
      addressProof: app.resubmissionDocs?.addressProof || false,
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingApp) return;

    if (!canManageDetails && !canChangeStatus && !canLeaveInternalNote) {
      toast.error("Your role is view-only for this application.");
      return;
    }

    if (editFormData.status === "rejected" && !editFormData.reason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    if (editFormData.status === "approved" && editingApp.paymentStatus !== "paid") {
      toast.error("Cannot approve application before payment is completed.");
      return;
    }

    try {
      const response = await fetch(`/api/admin/dsc-applications/${editingApp._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editFormData,
          resubmissionDocs: resubDocs,
        }),
      });
      const data = await parseApiResponse(response);

      if (response.ok && data.success) {
        toast.success("Application updated successfully");
        setIsEditModalOpen(false);
        fetchApplications();
      } else {
        toast.error(data.message || `Failed to update application (${response.status})`);
      }
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("An error occurred.");
    }
  };

  const getAvailableStatuses = (currentStatus: string) => {
    const options = new Set<string>([currentStatus || "pending"]);
    if (canReview) {
      options.add("pending");
      options.add("approved");
      options.add("rejected");
    }
    if (canDispatch) options.add("dispatched");
    if (canMarkDelivered) options.add("delivered");
    if (canIssue) options.add("issued");
    return Array.from(options);
  };

  const handleDownload = (app: DSCApplication) => {
    toast.success(`Downloading certificate for ${app.name}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Existing DSC Applications</h1>
          <p className="text-sm" style={{ color: colors.muted }}>Manage and track all registered DSCs</p>
        </div>
        
        {/* Actions, Search and Filter */}
        <div className="flex items-center gap-2">
          {onCreateNew && canManageDetails && (
            <button
              onClick={onCreateNew}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-semibold transition-all hover:scale-105 active:scale-95 text-xs"
              style={{ background: "var(--brand-gradient)" }}
            >
              <PlusCircle size={15} />
              <span>Create New DSC</span>
            </button>
          )}
          
          <div 
            className="flex items-center rounded-lg border px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20"
            style={{ backgroundColor: colors.card, borderColor: colors.borderSoft }}
          >
            <Search size={15} style={{ color: colors.muted }} className="mr-1.5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-transparent text-xs outline-none w-full md:w-48"
              style={{ color: colors.text }}
            />
          </div>
          <button
            onClick={fetchApplications}
            className="p-1.5 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            style={{ backgroundColor: colors.card, borderColor: colors.borderSoft, color: colors.text }}
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-xs font-semibold"
            style={{ backgroundColor: colors.card, borderColor: colors.borderSoft, color: colors.text }}
          >
            <Filter size={15} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div 
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: colors.card, borderColor: colors.borderSoft }}
      >
        <Table
          data={applications}
          loading={loading}
          loadingMessage={
            <div className="flex justify-center items-center gap-2 py-8">
              <RefreshCw size={15} className="animate-spin" />
              <span>Loading applications...</span>
            </div>
          }
          columns={[
            {
              header: "Name",
              render: (app) => <span className="font-semibold" style={{ color: colors.text }}>{app.name}</span>,
            },
            {
              header: "Mobile",
              render: (app) => <span style={{ color: colors.text }}>{app.number || "N/A"}</span>,
            },
            {
              header: "Email",
              render: (app) => <span style={{ color: colors.muted }}>{app.email}</span>,
            },
            {
              header: "Class",
              render: (app) => <span style={{ color: colors.text }}>{app.certificateClass || "N/A"}</span>,
            },
            {
              header: "Workflow",
              render: (app) => (
                <div className="space-y-1">
                  <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em]" style={{
                    backgroundColor:
                      app.status === "approved" || app.status === "issued"
                        ? "#ff6a0020"
                        : app.status === "rejected"
                          ? "#ef444420"
                          : app.status === "dispatched"
                            ? "#0ea5e920"
                            : app.status === "delivered"
                              ? "#06b6d420"
                              : "#f59e0b20",
                    color:
                      app.status === "approved" || app.status === "issued"
                        ? "#ff6a00"
                        : app.status === "rejected"
                          ? "#ef4444"
                          : app.status === "dispatched"
                            ? "#0ea5e9"
                            : app.status === "delivered"
                              ? "#06b6d4"
                              : "#f59e0b",
                  }}>
                    {app.status}
                  </span>
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: app.paymentStatus === "paid" ? "#ff6a00" : colors.muted }}>
                    Payment {app.paymentStatus || "pending"}
                  </div>
                </div>
              ),
            },
            {
              header: "Verified by",
              render: (app) => (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background-alt)] font-bold text-[var(--foreground)] tracking-wider">
                  {/* Fallback to PAN if not specified */}
                  {app.internalRemarks && app.internalRemarks.includes("aadhar") ? "Aadhar" : "PAN"}
                </span>
              ),
            },
            {
              header: "Actions",
              align: "right",
              render: (app) => (
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEditClick(app)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: colors.card, borderColor: colors.borderSoft, color: colors.text }}
                    title="Review Details"
                  >
                    <Eye size={12} />
                    <span>Review</span>
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(app._id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-rose-500/20 bg-rose-500/5 text-[10px] font-bold uppercase tracking-wider text-rose-500 transition-all hover:bg-rose-500/10"
                      title="Delete application"
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          keyExtractor={(app) => app._id}
          emptyMessage="No applications found."
        />

        {/* Pagination */}
        {!loading && applications.length > 0 && (
          <div 
            className="flex items-center justify-between px-6 py-4 border-t"
            style={{ borderColor: colors.borderSoft }}
          >
            <span className="text-sm" style={{ color: colors.muted }}>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                style={{ backgroundColor: colors.card, borderColor: colors.borderSoft, color: colors.text }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                style={{ backgroundColor: colors.card, borderColor: colors.borderSoft, color: colors.text }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal (using Portal to document.body to prevent stacking context constraints) */}
      {mounted && typeof document !== "undefined" && isEditModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div 
            className="rounded-xl border shadow-2xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
            style={{ 
              backgroundColor: isDarkMode ? "#0b151e" : "#ffffff", 
              borderColor: isDarkMode ? "rgba(125, 211, 252, 0.16)" : "rgba(16, 48, 69, 0.12)" 
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={20} style={{ color: colors.accent }} />
                <h2 className="text-xl font-bold" style={{ color: colors.text }}>Application Details & Actions</h2>
                <span className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]" style={{ backgroundColor: colors.accentSoft, color: colors.accent }}>
                  {getAdminRoleLabel(admin?.role)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Theme Toggle inside Modal */}
                <button
                  onClick={toggleTheme}
                  type="button"
                  className="p-1.5 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  style={{ 
                    borderColor: colors.borderSoft, 
                    color: colors.accent,
                    backgroundColor: colors.card 
                  }}
                  title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? <SunMedium size={18} /> : <Moon size={18} />}
                </button>
                
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-rose-500/10 active:scale-95 transition-all text-rose-500 animate-pulse border border-rose-500/20 bg-rose-500/5"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-[var(--border-soft)] mb-2">
              <button
                type="button"
                onClick={() => setActiveModalTab("edit")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeModalTab === "edit"
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Edit & Status
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab("details")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeModalTab === "details"
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Registration Details
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab("docs")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeModalTab === "docs"
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Documents
              </button>
            </div>

            {/* Edit Tab */}
            {activeModalTab === "edit" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Info */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium" style={{ color: colors.muted }}>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      disabled={!canManageDetails}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{ backgroundColor: colors.shell, borderColor: colors.borderSoft, color: colors.text }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium" style={{ color: colors.muted }}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditChange}
                      disabled={!canManageDetails}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{ backgroundColor: colors.shell, borderColor: colors.borderSoft, color: colors.text }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium" style={{ color: colors.muted }}>Mobile</label>
                    <input
                      type="text"
                      name="mobile"
                      value={editFormData.mobile}
                      onChange={handleEditChange}
                      disabled={!canManageDetails}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{ backgroundColor: colors.shell, borderColor: colors.borderSoft, color: colors.text }}
                    />
                  </div>

                  {/* DSC Details */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium" style={{ color: colors.muted }}>Certificate Class</label>
                    <select
                      name="certificateClass"
                      value={editFormData.certificateClass}
                      onChange={handleEditChange}
                      disabled={!canManageDetails}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{ backgroundColor: colors.shell, borderColor: colors.borderSoft, color: colors.text }}
                    >
                      <option value="Class 3">Class 3</option>
                      <option value="Class 2">Class 2</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium" style={{ color: colors.muted }}>Certificate Type</label>
                    <select
                      name="certType"
                      value={editFormData.certType}
                      onChange={handleEditChange}
                      disabled={!canManageDetails}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{ backgroundColor: colors.shell, borderColor: colors.borderSoft, color: colors.text }}
                    >
                      <option value="Signature">Signature</option>
                      <option value="Encryption">Encryption</option>
                      <option value="Combo">Combo</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium" style={{ color: colors.muted }}>Validity</label>
                    <select
                      name="validity"
                      value={editFormData.validity}
                      onChange={handleEditChange}
                      disabled={!canManageDetails}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{ backgroundColor: colors.shell, borderColor: colors.borderSoft, color: colors.text }}
                    >
                      <option value="1 Year">1 Year</option>
                      <option value="2 Years">2 Years</option>
                      <option value="3 Years">3 Years</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium" style={{ color: colors.muted }}>Token Type</label>
                    <select
                      name="tokenType"
                      value={editFormData.tokenType}
                      onChange={handleEditChange}
                      disabled={!canManageDetails}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{ backgroundColor: colors.shell, borderColor: colors.borderSoft, color: colors.text }}
                    >
                      <option value="USB Token">USB Token</option>
                      <option value="Soft Token">Soft Token</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium" style={{ color: colors.muted }}>Status</label>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditChange}
                      disabled={!canChangeStatus}
                      className="w-full rounded-lg border px-3 py-2 text-sm font-medium"
                      style={{ 
                        backgroundColor: colors.shell, 
                        borderColor: colors.borderSoft, 
                        color: 
                          editFormData.status === "issued" || editFormData.status === "approved" ? "#ff6a00" : 
                          editFormData.status === "pending" ? "#f59e0b" : 
                          editFormData.status === "rejected" ? "#ef4444" : colors.text
                      }}
                    >
                      {getAvailableStatuses(editingApp?.status || editFormData.status).map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Reason / Remarks */}
                <div className="space-y-1">
                  <label className="text-xs font-medium" style={{ color: colors.muted }}>Reason / Remarks (Required for Reject/Approve)</label>
                  <textarea
                    name="reason"
                    value={editFormData.reason}
                    onChange={handleEditChange}
                    rows={3}
                    disabled={!canLeaveInternalNote && !canChangeStatus}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ backgroundColor: colors.shell, borderColor: colors.borderSoft, color: colors.text }}
                    placeholder="Enter reason for approval or rejection..."
                  />
                </div>

                {editFormData.status === "rejected" && (
                  <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-500/5 space-y-2.5">
                    <p className="text-xs font-black uppercase tracking-wider text-rose-500">Flag Documents for Resubmission</p>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={resubDocs.photo}
                          onChange={(e) => setResubDocs(prev => ({ ...prev, photo: e.target.checked }))}
                          className="accent-rose-500 h-4 w-4"
                        />
                        <span>Require Photo</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={resubDocs.idProof}
                          onChange={(e) => setResubDocs(prev => ({ ...prev, idProof: e.target.checked }))}
                          className="accent-rose-500 h-4 w-4"
                        />
                        <span>Require ID Proof</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={resubDocs.addressProof}
                          onChange={(e) => setResubDocs(prev => ({ ...prev, addressProof: e.target.checked }))}
                          className="accent-rose-500 h-4 w-4"
                        />
                        <span>Require Address Proof</span>
                      </label>
                    </div>
                  </div>
                )}

                {editingApp?.status === "rejected" && (
                  <div className="text-xs font-semibold" style={{ color: colors.text }}>
                    <span>Remarks viewed by user: </span>
                    {editingApp.remarksViewed ? (
                      <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 font-bold uppercase tracking-wider">Yes</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold uppercase tracking-wider animate-pulse">Not Yet</span>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  {canDelete && editingApp && (
                    <button
                      onClick={() => handleDelete(editingApp._id)}
                      className="px-4 py-2 rounded-lg border border-rose-500/20 bg-rose-500/5 text-sm font-semibold text-rose-500"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm font-medium"
                    style={{ backgroundColor: colors.card, borderColor: colors.borderSoft, color: colors.text }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={!canManageDetails && !canChangeStatus && !canLeaveInternalNote}
                    className="px-4 py-2 rounded-lg text-white font-medium transition-all hover:scale-105 active:scale-95 text-sm"
                    style={{ background: "var(--brand-gradient)" }}
                  >
                    {canChangeStatus ? "Save & Update Status" : "Save Internal Notes"}
                  </button>
                </div>
              </>
            )}

            {/* Registration Details Tab */}
            {activeModalTab === "details" && editingApp && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Two columns grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Personal & Address Details */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[var(--accent)] border-b pb-1" style={{ borderColor: colors.borderSoft }}>
                      Personal & Address Details
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="font-semibold text-[var(--muted)]">Gender</p>
                        <p className="font-bold text-[var(--foreground)] uppercase mt-0.5">{editingApp.gender || "N/A"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--muted)]">Date of Birth</p>
                        <p className="font-bold text-[var(--foreground)] mt-0.5">{editingApp.dob || "N/A"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-semibold text-[var(--muted)]">Full Address</p>
                        <p className="font-bold text-[var(--foreground)] mt-0.5">{editingApp.address || "N/A"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--muted)]">City</p>
                        <p className="font-bold text-[var(--foreground)] mt-0.5">{editingApp.city || "N/A"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--muted)]">State</p>
                        <p className="font-bold text-[var(--foreground)] mt-0.5">{editingApp.state || "N/A"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--muted)]">Pincode</p>
                        <p className="font-bold text-[var(--foreground)] mt-0.5">{editingApp.pincode || "N/A"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--muted)]">E-KYC PIN</p>
                        <p className="font-bold text-[var(--foreground)] mt-0.5 uppercase">{editingApp.ekycPin || "N/A"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-semibold text-[var(--muted)]">E-KYC ID</p>
                        <p className="font-bold text-[var(--foreground)] mt-0.5 uppercase break-all text-[11px] select-all leading-normal" style={{ color: colors.accent }}>{editingApp.ekycId || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Billing & Verification */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[var(--accent)] border-b pb-1" style={{ borderColor: colors.borderSoft }}>
                      Billing & Verification Info
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="font-semibold text-[var(--muted)]">PAN Card</p>
                        <p className="font-bold text-[var(--foreground)] uppercase mt-0.5">{editingApp.pan || "N/A"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--muted)]">Aadhaar Verified</p>
                        <p className="font-bold text-[var(--foreground)] mt-0.5">
                          {editingApp.isAadhaarVerified ? (
                            <span className="text-orange-500 font-black">YES</span>
                          ) : (
                            <span className="text-rose-500 font-black">NO</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--muted)]">Profile Verified</p>
                        <p className="font-bold text-[var(--foreground)] mt-0.5">
                          {editingApp.isVerified ? (
                            <span className="text-orange-500 font-black">YES</span>
                          ) : (
                            <span className="text-rose-500 font-black">NO</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--muted)]">Payment Status</p>
                        <p className="font-bold mt-0.5 uppercase" style={{
                          color: editingApp.paymentStatus === "paid" ? "#ff6a00" : "#ef4444"
                        }}>
                          {editingApp.paymentStatus || "PENDING"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--muted)]">Base Price</p>
                        <p className="font-bold text-[var(--foreground)] mt-0.5">₹{editingApp.price || 0}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--muted)]">Commission</p>
                        <p className="font-bold text-[var(--foreground)] mt-0.5">₹{editingApp.commission || 0}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--muted)]">GST Amount</p>
                        <p className="font-bold text-[var(--foreground)] mt-0.5">₹{editingApp.gst || 0}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--muted)]">Service Type</p>
                        <p className="font-bold text-[var(--foreground)] uppercase mt-0.5">{editingApp.serviceType || "N/A"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--muted)]">BP Code</p>
                        <p className="font-bold text-[var(--foreground)] mt-0.5 uppercase">{editingApp.bpCode || "N/A"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-semibold text-[var(--muted)]">Client ID</p>
                        <p className="font-bold text-[var(--foreground)] mt-0.5 uppercase break-all text-[11px] select-all leading-normal" style={{ color: colors.accent }}>{editingApp.clientId || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: System Info & Metadata */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[var(--accent)] border-b pb-1" style={{ borderColor: colors.borderSoft }}>
                    System Metadata
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[var(--background-alt)] p-3 rounded-lg border border-[var(--border-soft)]">
                    <div className="space-y-1.5">
                      <p><span className="font-semibold text-[var(--muted)]">Application ID:</span> <span className="font-mono font-bold text-[var(--foreground)] uppercase">{editingApp.dscId || "N/A"}</span></p>
                      <p><span className="font-semibold text-[var(--muted)]">Database ID (_id):</span> <span className="font-mono font-bold text-[var(--foreground)]">{editingApp._id}</span></p>
                      <p><span className="font-semibold text-[var(--muted)]">Version (__v):</span> <span className="font-mono font-bold text-[var(--foreground)]">{editingApp.__v !== undefined ? editingApp.__v : "0"}</span></p>
                    </div>
                    <div className="space-y-1.5">
                      <p><span className="font-semibold text-[var(--muted)]">Created By:</span> <span className="font-bold text-[var(--foreground)] uppercase">{editingApp.createdBy || "N/A"}</span> <span className="font-mono text-gray-500 font-semibold">({editingApp.createdById || "N/A"})</span></p>
                      <p><span className="font-semibold text-[var(--muted)]">Created At:</span> <span className="font-bold text-[var(--foreground)]">{new Date(editingApp.createdAt).toLocaleString()}</span></p>
                      <p><span className="font-semibold text-[var(--muted)]">Updated At:</span> <span className="font-bold text-[var(--foreground)]">{editingApp.updatedAt ? new Date(editingApp.updatedAt).toLocaleString() : "N/A"}</span></p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[var(--accent)] border-b pb-1" style={{ borderColor: colors.borderSoft }}>
                    Audit Trail
                  </h3>
                  <div className="space-y-2 rounded-lg border border-[var(--border-soft)] bg-[var(--background-alt)] p-3">
                    {(editingApp.auditTrail || []).slice(-5).reverse().map((entry, index) => (
                      <div key={`${entry.timestamp}-${index}`} className="rounded-lg border border-[var(--border-soft)] bg-[var(--card)] px-3 py-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--foreground)]">
                            {entry.actorName} • {entry.actorRole.replaceAll("_", " ")}
                          </p>
                          <p className="text-[10px] font-semibold text-[var(--muted)]">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-[var(--foreground)]">
                          {entry.fromStatus && entry.toStatus
                            ? `${entry.fromStatus} -> ${entry.toStatus}`
                            : entry.action}
                        </p>
                        {entry.remarks ? (
                          <p className="mt-1 text-[11px] text-[var(--muted)]">{entry.remarks}</p>
                        ) : null}
                      </div>
                    ))}
                    {(!editingApp.auditTrail || editingApp.auditTrail.length === 0) && (
                      <p className="text-xs font-semibold text-[var(--muted)]">
                        No audit activity recorded yet for this application.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeModalTab === "docs" && editingApp && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--accent)] border-b pb-1" style={{ borderColor: colors.borderSoft }}>
                  Uploaded Documents & Proofs
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Photo */}
                  <div className="border border-[var(--border-soft)] rounded-lg p-3 bg-[var(--background-alt)] flex flex-col justify-between space-y-3">
                    <div>
                      <p className="text-xs font-bold text-[var(--foreground)] uppercase mb-1">User Photo</p>
                      <p className="text-[10px] font-semibold text-[var(--muted)] uppercase">PHOTO</p>
                    </div>
                    <div className="h-32 w-full flex items-center justify-center border border-[var(--border-soft)] rounded bg-white overflow-hidden relative group">
                      {editingApp.photo && editingApp.photo.startsWith("http") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={getDocumentRouteHref(editingApp._id, "photo")} 
                          alt="User Photo" 
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-[10px] font-semibold text-[var(--muted)]">No Photo Available</span>
                      )}
                    </div>
                    {editingApp.photo && (
                      <a 
                        href={getDocumentRouteHref(editingApp._id, "photo")} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full text-center py-1.5 px-3 rounded border text-[10px] font-black uppercase tracking-wider bg-[var(--card)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        style={{ color: colors.text, borderColor: colors.borderSoft }}
                      >
                        Open Document
                      </a>
                    )}
                  </div>

                  {/* ID Proof */}
                  <div className="border border-[var(--border-soft)] rounded-lg p-3 bg-[var(--background-alt)] flex flex-col justify-between space-y-3">
                    <div>
                      <p className="text-xs font-bold text-[var(--foreground)] uppercase mb-1">ID Proof</p>
                      <p className="text-[10px] font-semibold text-[var(--muted)] uppercase">PAN Card / Aadhaar</p>
                    </div>
                    <div className="h-32 w-full flex items-center justify-center border border-[var(--border-soft)] rounded bg-white overflow-hidden relative group">
                      {editingApp.idProof && editingApp.idProof.startsWith("http") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={getDocumentRouteHref(editingApp._id, "idProof")} 
                          alt="ID Proof" 
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-[10px] font-semibold text-[var(--muted)]">No ID Proof Available</span>
                      )}
                    </div>
                    {editingApp.idProof && (
                      <a 
                        href={getDocumentRouteHref(editingApp._id, "idProof")} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full text-center py-1.5 px-3 rounded border text-[10px] font-black uppercase tracking-wider bg-[var(--card)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        style={{ color: colors.text, borderColor: colors.borderSoft }}
                      >
                        Open Document
                      </a>
                    )}
                  </div>

                  {/* Address Proof */}
                  <div className="border border-[var(--border-soft)] rounded-lg p-3 bg-[var(--background-alt)] flex flex-col justify-between space-y-3">
                    <div>
                      <p className="text-xs font-bold text-[var(--foreground)] uppercase mb-1">Address Proof</p>
                      <p className="text-[10px] font-semibold text-[var(--muted)] uppercase">Utility Bill / Passport</p>
                    </div>
                    <div className="h-32 w-full flex items-center justify-center border border-[var(--border-soft)] rounded bg-white overflow-hidden relative group">
                      {editingApp.addressProof && editingApp.addressProof.startsWith("http") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={getDocumentRouteHref(editingApp._id, "addressProof")} 
                          alt="Address Proof" 
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-[10px] font-semibold text-[var(--muted)]">No Address Proof Available</span>
                      )}
                    </div>
                    {editingApp.addressProof && (
                      <a 
                        href={getDocumentRouteHref(editingApp._id, "addressProof")} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full text-center py-1.5 px-3 rounded border text-[10px] font-black uppercase tracking-wider bg-[var(--card)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        style={{ color: colors.text, borderColor: colors.borderSoft }}
                      >
                        Open Document
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Read-only tabs Close Button */}
            {activeModalTab !== "edit" && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm font-medium"
                  style={{ backgroundColor: colors.card, borderColor: colors.borderSoft, color: colors.text }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

