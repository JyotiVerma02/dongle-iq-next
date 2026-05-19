import winston from "winston";

const isProd = process.env.NODE_ENV === "production";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "dongle-iq-next" },

  transports: [
    // ✅ Always safe (Vercel compatible)
    new winston.transports.Console({
      format: isProd
        ? winston.format.json()
        : winston.format.simple(),
    }),
  ],
});

export default logger;