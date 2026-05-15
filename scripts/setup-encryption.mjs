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

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const envFile = path.join(rootDir, '.env');
const envExampleFile = path.join(rootDir, '.env.example');

console.log('🔐 DongleIQ Encryption Key Setup\n');

// Generate a new encryption key
function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Validate encryption key format
function validateEncryptionKey(key) {
  if (key.length !== 64) {
    return false;
  }
  try {
    Buffer.from(key, 'hex');
    return true;
  } catch {
    return false;
  }
}

// Check if .env has ENCRYPTION_KEY
function checkExistingKey() {
  if (!fs.existsSync(envFile)) {
    return null;
  }

  const envContent = fs.readFileSync(envFile, 'utf-8');
  const match = envContent.match(/^ENCRYPTION_KEY=(.+)$/m);
  return match ? match[1].trim() : null;
}

// Main execution
async function main() {
  try {
    // Check for existing key
    const existingKey = checkExistingKey();

    if (existingKey) {
      if (validateEncryptionKey(existingKey)) {
        console.log('✅ Valid ENCRYPTION_KEY found in .env');
        console.log(`📝 Key: ${existingKey.substring(0, 16)}... (truncated for security)`);
        
        const prompt = require('prompt-sync')();
        const answer = prompt('\n🔄 Do you want to generate a new key? (y/n): ');
        
        if (answer.toLowerCase() !== 'y') {
          console.log('\n✨ Encryption setup complete. No changes made.\n');
          return;
        }
      } else {
        console.log('⚠️  Invalid ENCRYPTION_KEY found in .env');
        console.log('📝 Key format is incorrect. Generating new key...\n');
      }
    } else {
      console.log('📭 No ENCRYPTION_KEY found in .env');
      console.log('🔑 Generating new encryption key...\n');
    }

    // Generate new key
    const newKey = generateEncryptionKey();

    if (!validateEncryptionKey(newKey)) {
      throw new Error('Generated key validation failed');
    }

    console.log('✅ New encryption key generated:\n');
    console.log(`📌 ${newKey}\n`);

    // Show instructions
    console.log('📋 Instructions:\n');
    console.log('1. Copy the key above');
    console.log('2. Add to your .env file:\n');
    console.log(`   ENCRYPTION_KEY=${newKey}\n`);
    console.log('3. Restart your application\n');

    // Optionally update .env file
    const prompt = require('prompt-sync')();
    const shouldUpdate = prompt('Would you like to add this key to .env now? (y/n): ');

    if (shouldUpdate.toLowerCase() === 'y') {
      if (fs.existsSync(envFile)) {
        let envContent = fs.readFileSync(envFile, 'utf-8');

        // Remove existing ENCRYPTION_KEY if present
        envContent = envContent.replace(/^ENCRYPTION_KEY=.+$/m, '');

        // Add new key
        envContent += `\nENCRYPTION_KEY=${newKey}\n`;

        fs.writeFileSync(envFile, envContent, 'utf-8');
        console.log('\n✅ ENCRYPTION_KEY added to .env\n');
      } else {
        console.log('\n⚠️  .env file not found. Please create it manually with:\n');
        console.log(`   ENCRYPTION_KEY=${newKey}\n`);
      }
    }

    console.log('🎉 Encryption setup complete!\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main();
