import { useMemo } from "react";
import { User, DashboardStats } from "../types";

export function useDashboardStats(users: User[]): DashboardStats {
  return useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let totalRevenue = 0;
    let dscCount = 0;
    let tokenCount = 0;
    let assistedCount = 0;

    users.forEach((user) => {
      if (user.status === "pending") pending++;
      if (user.status === "approved") approved++;
      if (user.status === "rejected") rejected++;

      if (user.paymentStatus === "paid") {
        totalRevenue += Number(user.price || 0) + Number(user.commission || 0); // Simplified revenue logic for mock
      }

      if (user.serviceType === "dsc") dscCount++;
      if (user.serviceType === "token") tokenCount++;
      if (user.serviceType === "assisted") assistedCount++;
    });

    const total = users.length || 1; // Prevent division by zero

    return {
      totalApplications: users.length,
      pending,
      approved,
      rejected,
      totalRevenue,
      revenueGrowth: 12, // Mocked growth
      dscPercentage: Math.round((dscCount / total) * 100),
      tokenPercentage: Math.round((tokenCount / total) * 100),
      assistedPercentage: Math.round((assistedCount / total) * 100),
    };
  }, [users]);
}
