const USER_NOTIFICATION_ORDER = new Map<string, number>([
  ["Application Submitted", 1],
  ["Payment Successful", 2],
  ["Documents Verified", 3],
  ["Action Required", 3],
  ["Application Approved", 4],
  ["DSC Ready", 5],
]);

export function getUserNotificationRank(item: {
  title?: string;
  createdAt?: string;
}) {
  void item.createdAt;
  return USER_NOTIFICATION_ORDER.get(item.title || "") ?? 99;
}

export function sortUserNotifications<T extends { title?: string; createdAt?: string }>(
  notifications: T[],
) {
  return [...notifications].sort((a, b) => {
    const rankDiff = getUserNotificationRank(a) - getUserNotificationRank(b);
    if (rankDiff !== 0) return rankDiff;

    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}
