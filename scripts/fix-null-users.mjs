/**
 * Run this script ONCE to clean up malformed user documents in MongoDB
 * that have null/missing email/number fields (caused by the old schema bug).
 *
 * Usage: node scripts/fix-null-users.mjs
 * (requires MONGODB_URI in your .env.local)
 */

import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env from .env.local manually
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
  console.warn("Could not read .env.local, ensure MONGODB_URI is set.");
}

const require = createRequire(import.meta.url);
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI is not defined!");
  process.exit(1);
}

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI, { ssl: true, authSource: "admin" });
  console.log("Connected!");

  const db = mongoose.connection.db;
  const usersCollection = db.collection("users");

  // Find all bad documents (null or missing email)
  const badUsers = await usersCollection
    .find({ $or: [{ email: null }, { email: { $exists: false } }] })
    .toArray();

  console.log(`Found ${badUsers.length} malformed user(s) with null/missing email.`);

  if (badUsers.length > 0) {
    for (const u of badUsers) {
      console.log(
        `  Deleting: _id=${u._id}, name=${u.name ?? "(none)"}, createdAt=${u.createdAt ?? "(none)"}`
      );
    }
    const result = await usersCollection.deleteMany({
      $or: [{ email: null }, { email: { $exists: false } }],
    });
    console.log(`Deleted ${result.deletedCount} malformed user(s).`);
  } else {
    console.log("No malformed users found. Database is clean!");
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
