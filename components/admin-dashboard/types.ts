export type DashboardView = "home" | "admin" | "ledger" | "applications";
export type AdminProfile = {
  _id?: string;
  name?: string;
  email?: string;
  number?: string;
  role?: string;
  status?: string;
  createdAt?: string;
};
export type DashboardStats = {
  totalUsers: number;
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  verified: number;
  dscCommission: number;
  tokenAmount: number;
  assistedAmount: number;
  totalCommission: number;
  gstPaid: number;
  paidCommission: number;
  pendingApproval: number;
  unpaidCommission: number;
};
