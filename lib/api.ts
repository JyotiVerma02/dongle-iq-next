import type {
  AdminProfile,
} from "@/components/admin-dashboard/types";
import type { DashboardUser } from "@/components/UserLedger";

type UserStatus = DashboardUser["status"];
type PaymentStatus = "paid" | "unpaid";
type StatusFilter = UserStatus | "all";
type DashboardMetrics = {
  totalUsers: number;
  approved: number;
  pending: number;
  rejected: number;
  totalCommission: number;
  paidCommission: number;
  unpaidCommission: number;
  totalGst: number;
  serviceStats: {
    dsc: number;
    token: number;
    assisted: number;
  };
};

type ApiSuccess<T> = T & {
  success: true;
};

type ApiFailure = {
  success: false;
  message?: string;
};

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !data?.success) {
    const message =
      data && "message" in data ? data.message : "Something went wrong";
    throw new Error(message || "Something went wrong");
  }

  return data;
}

export async function getAdminProfile() {
  const data = await request<{ admin: AdminProfile | null }>("/api/get-admin");
  return data.admin;
}

export async function getUsers() {
  const data = await request<{ users: DashboardUser[] }>("/api/get-users");
  return data.users;
}

export async function updateAdminProfile(payload: AdminProfileFormPayload) {
  const data = await request<{ admin: AdminProfile }>("/api/admin/update-profile", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.admin;
}

export async function updateUserStatus(payload: {
  userId: string;
  status: UserStatus;
  internalRemarks?: string;
}) {
  const data = await request<{ user: DashboardUser }>("/api/admin/update-status", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.user;
}

export async function updateUserPayment(payload: {
  userId: string;
  paymentStatus: PaymentStatus;
}) {
  const data = await request<{ user: DashboardUser }>("/api/admin/update-payment", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.user;
}

export type AdminProfileFormPayload = {
  name: string;
  email: string;
  number: string;
  role: string;
};

export type DashboardQueryParams = {
  search: string;
  status: StatusFilter;
  payment: PaymentFilter;
  page: number;
  pageSize: number;
};

export type PaymentFilter = "all" | "paid" | "unpaid" | "pending";

export type PaginatedUsers = {
  items: DashboardUser[];
  totalItems: number;
  totalPages: number;
  page: number;
};

export function filterAndPaginateUsers(
  users: DashboardUser[],
  params: DashboardQueryParams,
): PaginatedUsers {
  const normalizedSearch = params.search.trim().toLowerCase();

  const filtered = users.filter((user) => {
    const matchesSearch =
      !normalizedSearch ||
      [
        user.name,
        user.email,
        user.number,
        user.pan,
        user.certType,
        user.serviceType,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(normalizedSearch),
        );

    const matchesStatus =
      params.status === "all" || user.status === params.status;

    const matchesPayment =
      params.payment === "all" || user.paymentStatus === params.payment;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / params.pageSize));
  const safePage = Math.min(params.page, totalPages);
  const startIndex = (safePage - 1) * params.pageSize;

  return {
    items: filtered.slice(startIndex, startIndex + params.pageSize),
    totalItems,
    totalPages,
    page: safePage,
  };
}

export function buildMetrics(users: DashboardUser[]): DashboardMetrics {
  const baseServiceStats = {
    dsc: 0,
    token: 0,
    assisted: 0,
  };

  return users.reduce<DashboardMetrics>(
    (accumulator, user) => {
      accumulator.totalUsers += 1;
      accumulator.totalCommission += user.commission ?? 0;
      accumulator.totalGst += user.gst ?? 0;

      if (user.status === "approved") accumulator.approved += 1;
      if (user.status === "pending") accumulator.pending += 1;
      if (user.status === "rejected") accumulator.rejected += 1;

      if (user.paymentStatus === "paid") {
        accumulator.paidCommission += user.commission ?? 0;
      } else if (user.paymentStatus === "unpaid") {
        accumulator.unpaidCommission += user.commission ?? 0;
      }

      if (user.serviceType in accumulator.serviceStats) {
        accumulator.serviceStats[user.serviceType as keyof typeof baseServiceStats] += 1;
      }

      return accumulator;
    },
    {
      totalUsers: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      totalCommission: 0,
      paidCommission: 0,
      unpaidCommission: 0,
      totalGst: 0,
      serviceStats: baseServiceStats,
    },
  );
}
