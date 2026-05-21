export type DashboardView =
  | "home"
  | "applications"
  | "reports"
  | "track-dsc"
  | "admin-settings"
  | "create-dsc";

export type ApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "dispatched"
  | "delivered"
  | "issued";
export type PaymentStatus = "paid" | "pending" | "unpaid";
export type ServiceType = "dsc" | "token" | "assisted";
export type AdminRole =
  | "super_admin"
  | "reviewer"
  | "dispatcher"
  | "support_team"
  | "finance_admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  number: string;
  serviceType: ServiceType;
  status: ApplicationStatus;
  paymentStatus: PaymentStatus;
  price: number;
  commission: number;
  gst: number;
  isAadhaarVerified: boolean;
  createdAt: string;
  updatedAt: string;
  appId?: string; // e.g. DSC001
}

export interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  number: string;
  role: AdminRole | string;
  avatar?: string;
  twoFactorEnabled?: boolean;
}

export interface DashboardStats {
  totalApplications: number;
  pending: number;
  approved: number;
  rejected: number;
  totalRevenue: number;
  revenueGrowth: number;
  dscPercentage: number;
  tokenPercentage: number;
  assistedPercentage: number;
}
