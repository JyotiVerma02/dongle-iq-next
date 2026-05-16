#!/usr/bin/env node

/**
 * Setup script for generating and validating ENCRYPTION_KEY
 *
 * Usage:
 *   node scripts/setup-encryption.mjs
 *
 * This will:
 * 1. Generate a new 32-byte (64 hex character) encryption key
 * 2. Display instructions on how to add it to .env
 * 3. Validate the key format
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import readline from "readline/promises";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const envFile = path.join(rootDir, ".env");

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("DongleIQ Encryption Key Setup\n");

function generateEncryptionKey() {
  return crypto.randomBytes(32).toString("hex");
}

function validateEncryptionKey(key) {
  if (key.length !== 64) {
    return false;
  }

  try {
    Buffer.from(key, "hex");
    return true;
  } catch {
    return false;
  }
}

function checkExistingKey() {
  if (!fs.existsSync(envFile)) {
    return null;
  }

  const envContent = fs.readFileSync(envFile, "utf-8");
  const match = envContent.match(/^ENCRYPTION_KEY=(.+)$/m);
  return match ? match[1].trim() : null;
}

async function askYesNo(question) {
  const answer = await terminal.question(question);
  return answer.trim().toLowerCase() === "y";
}

async function main() {
  try {
    const existingKey = checkExistingKey();

    if (existingKey) {
      if (validateEncryptionKey(existingKey)) {
        console.log("Valid ENCRYPTION_KEY found in .env");
        console.log(`Key: ${existingKey.substring(0, 16)}... (truncated for security)`);

        const shouldRegenerate = await askYesNo(
          "\nDo you want to generate a new key? (y/n): ",
        );

        if (!shouldRegenerate) {
          console.log("\nEncryption setup complete. No changes made.\n");
          return;
        }
      } else {
        console.log("Invalid ENCRYPTION_KEY found in .env");
        console.log("Key format is incorrect. Generating new key...\n");
      }
    } else {
      console.log("No ENCRYPTION_KEY found in .env");
      console.log("Generating new encryption key...\n");
    }

    const newKey = generateEncryptionKey();

    if (!validateEncryptionKey(newKey)) {
      throw new Error("Generated key validation failed");
    }

    console.log("New encryption key generated:\n");
    console.log(`${newKey}\n`);

    console.log("Instructions:\n");
    console.log("1. Copy the key above");
    console.log("2. Add to your .env file:\n");
    console.log(`   ENCRYPTION_KEY=${newKey}\n`);
    console.log("3. Restart your application\n");

    const shouldUpdate = await askYesNo(
      "Would you like to add this key to .env now? (y/n): ",
    );

    if (shouldUpdate) {
      if (fs.existsSync(envFile)) {
        let envContent = fs.readFileSync(envFile, "utf-8");
        envContent = envContent.replace(/^ENCRYPTION_KEY=.+$/m, "").trimEnd();
        envContent += `\nENCRYPTION_KEY=${newKey}\n`;
        fs.writeFileSync(envFile, envContent, "utf-8");
        console.log("\nENCRYPTION_KEY added to .env\n");
      } else {
        console.log("\n.env file not found. Please create it manually with:\n");
        console.log(`   ENCRYPTION_KEY=${newKey}\n`);
      }
    }

    console.log("Encryption setup complete!\n");
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : "Unknown error",
    );
    process.exitCode = 1;
  } finally {
    terminal.close();
  }
}

void main();
