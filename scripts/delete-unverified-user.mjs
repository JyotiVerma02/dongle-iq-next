/**
 * Find the user with nickyverma.feb9@gmail.com (or any unverified user you want to delete)
 * and delete them so they can re-register fresh.
 * Usage: node scripts/delete-unverified-user.mjs nickyverma.feb9@gmail.com
 */

import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

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
} catch {}

const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;

const emailToDelete = process.argv[2];
if (!emailToDelete) {
  console.error("Usage: node scripts/delete-unverified-user.mjs <email>");
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGODB_URI, { ssl: true, authSource: "admin" });
  const db = mongoose.connection.db;

  const user = await db.collection("users").findOne({ email: emailToDelete.toLowerCase() });
  if (!user) {
    console.log(`No user found with email: ${emailToDelete}`);
  } else {
    console.log(`Found user: name=${user.name}, isVerified=${user.isVerified}, createdAt=${user.createdAt}`);
    if (user.isVerified) {
      console.log("User is already verified! Skipping delete.");
    } else {
      const r = await db.collection("users").deleteOne({ email: emailToDelete.toLowerCase() });
      console.log(`Deleted unverified user. (deletedCount: ${r.deletedCount})`);
    }
  }

  // Also show full list of all users with their emails and verified state
  const allUsers = await db.collection("users").find({}, { projection: { name: 1, email: 1, isVerified: 1 } }).toArray();
  console.log("\nAll users in DB:");
  for (const u of allUsers) {
    console.log(`  ${u.name} | ${u.email} | verified: ${u.isVerified}`);
  }

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
