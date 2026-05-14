export type DashboardView =
  | "home"
  | "admin"
  | "ledger"
  | "ledger-new"
  | "ledger-old"
  | "applications"
  | "track-dsc";
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
  issued: number;
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
