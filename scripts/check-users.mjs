/**
 * Check all users in DB - show their email, isVerified, createdAt
 * Usage: node scripts/check-users.mjs
 */

import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = resolve(__dirname, "../.env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  console.warn("Could not read .env.local");
}

const require = createRequire(import.meta.url);
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI is not defined!");
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGODB_URI, { ssl: true, authSource: "admin" });
  const db = mongoose.connection.db;
  const users = await db.collection("users").find({}).toArray();
  console.log(`\nTotal users in DB: ${users.length}\n`);
  for (const u of users) {
    console.log(`  _id: ${u._id}`);
    console.log(`  name: ${u.name}`);
    console.log(`  email: ${u.email}`);
    console.log(`  number: ${u.number}`);
    console.log(`  isVerified: ${u.isVerified}`);
    console.log(`  createdAt: ${u.createdAt}`);
    console.log(`  hasOtp: ${!!u.otp}`);
    console.log(`  otpExpiry: ${u.otpExpiry}`);
    console.log("  ---");
  }
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
