export type DashboardView =
  | "home"
  | "applications"
  | "reports"
  | "track-dsc"
  | "admin-settings"
  | "create-dsc";

export type ApplicationStatus = "pending" | "approved" | "rejected" | "issued";
export type PaymentStatus = "paid" | "unpaid";
export type ServiceType = "dsc" | "token" | "assisted";

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
  role: "super_admin" | "admin" | "viewer" | string;
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
