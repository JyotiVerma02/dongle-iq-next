import { ensureRedisConnected, redis } from "@/lib/redis";

const USER_DASHBOARD_PREFIX = "dashboard:user:";
const ADMIN_USERS_PREFIX = "dashboard:admin:users:";
export const ADMIN_REPORTS_CACHE_KEY = "dashboard:admin:reports:summary";

export async function getCachedJson<T>(key: string): Promise<T | null> {
  await ensureRedisConnected();

  const rawValue = await redis.get(key);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
}

export async function setCachedJson<T>(
  key: string,
  value: T,
  ttlSeconds = 60,
) {
  await ensureRedisConnected();
  await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
}

export async function invalidateCacheKey(key: string) {
  await ensureRedisConnected();
  await redis.del(key);
}

export async function invalidateCachePrefix(prefix: string) {
  await ensureRedisConnected();
  const keys: string[] = [];

  for await (const key of redis.scanIterator({ MATCH: `${prefix}*`, COUNT: 100 })) {
    if (Array.isArray(key)) {
      keys.push(...(key as string[]));
    } else {
      keys.push(key as string);
    }
  }

  if (keys.length > 0) {
    await redis.del(keys);
  }
}

export async function invalidateUserDashboardCache(userId: string) {
  await invalidateCacheKey(`${USER_DASHBOARD_PREFIX}${userId}`);
}

export async function invalidateAdminUsersCache() {
  await invalidateCachePrefix(ADMIN_USERS_PREFIX);
}

export function getUserDashboardCacheKey(userId: string) {
  return `${USER_DASHBOARD_PREFIX}${userId}`;
}

export function getAdminUsersCacheKey(queryKey: string) {
  return `${ADMIN_USERS_PREFIX}${queryKey}`;
}
