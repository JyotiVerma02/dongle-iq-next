import { createClient } from "redis";

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient>;
};

export const redis =
  globalForRedis.redis ??
  createClient({
    url: process.env.REDIS_URL,
  });

if (!globalForRedis.redis) {
  globalForRedis.redis = redis;
}

redis.on("error", (err) => {
  console.log("Redis Error:", err);
});

if (!redis.isOpen) {
  redis.connect();
}