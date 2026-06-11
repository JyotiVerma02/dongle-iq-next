import { createClient } from "redis";

export type RedisClientType = ReturnType<typeof createClient>;

const memoryStore = new Map<string, { value: string; expiresAt?: number }>();

function createMemoryRedis(): any {
  return {
    isOpen: true,
    on: () => undefined,
    connect: async () => undefined,
    async get(key: string) {
      const entry = memoryStore.get(key);
      if (!entry) return null;
      if (entry.expiresAt && entry.expiresAt <= Date.now()) {
        memoryStore.delete(key);
        return null;
      }
      return entry.value;
    },
    async set(key: string, value: string, options?: { EX?: number }) {
      memoryStore.set(key, {
        value,
        expiresAt: options?.EX ? Date.now() + options.EX * 1000 : undefined,
      });
      return "OK";
    },
    async del(...keys: string[]) {
      let deleted = 0;
      for (const key of keys) {
        if (memoryStore.delete(key)) {
          deleted += 1;
        }
      }
      return deleted;
    },
    async *scanIterator(options: { MATCH?: string; COUNT?: number }) {
      const match = options.MATCH || "*";
      const regex = new RegExp(
        `^${match.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, ".*")}$`,
      );

      for (const key of memoryStore.keys()) {
        if (regex.test(key)) {
          yield key;
        }
      }
    },
    // Add dummy json namespace to prevent immediate crashes if mocked
    json: {
      get: async () => null,
      set: async () => "OK",
    },
    ft: {
      search: async () => ({ total: 0, documents: [] }),
    }
  };
}

type GlobalRedis = typeof globalThis & {
  __dongleIqRedis?: RedisClientType;
  __dongleIqRedisConnectPromise?: Promise<any> | null;
};

const globalForRedis = globalThis as GlobalRedis;

const shouldUseRealRedis = Boolean(process.env.REDIS_URL);

export const redis =
  globalForRedis.__dongleIqRedis ??
  (shouldUseRealRedis
    ? (createClient({ url: process.env.REDIS_URL }) as RedisClientType)
    : (createMemoryRedis() as RedisClientType));

if (!globalForRedis.__dongleIqRedis) {
  globalForRedis.__dongleIqRedis = redis;
}

// console.log("REDIS_URL =", process.env.REDIS_URL);

// redis.on("connect", () => {
//   console.log("✅ Redis CONNECTED");
// });

// redis.on("ready", () => {
//   console.log("✅ Redis READY");
// });


redis.on("error", (err) => {
  console.log("Redis Error:", err);
});

export async function ensureRedisConnected() {
  if (!shouldUseRealRedis) {
    return;
  }

  if (redis.isOpen) {
    return;
  }

  if (!globalForRedis.__dongleIqRedisConnectPromise) {
    globalForRedis.__dongleIqRedisConnectPromise = redis
      .connect()
      .catch((error) => {
        globalForRedis.__dongleIqRedisConnectPromise = null;
        throw error;
      });
  }

  await globalForRedis.__dongleIqRedisConnectPromise;
}
