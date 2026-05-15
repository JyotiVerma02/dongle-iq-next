import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const ENCODING = "hex";
const AUTH_TAG_LENGTH = 16;
const IV_LENGTH = 16;
let warnedAboutFallback = false;

/**
 * Encryption key management
 * In production, this should be managed by a key management service
 */
function getEncryptionKey(): Buffer {
  const keyEnv = process.env.ENCRYPTION_KEY;

  if (!keyEnv) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "ENCRYPTION_KEY environment variable not set. Generate a 64-character hex key and add to .env"
      );
    }

    if (!warnedAboutFallback) {
      warnedAboutFallback = true;
      console.warn(
        "ENCRYPTION_KEY is missing. Falling back to a development-only derived key.",
      );
    }

    const fallbackSource =
      process.env.JWT_SECRET ||
      process.env.MONGODB_URI ||
      "dongle-iq-dev-encryption-fallback";

    return crypto.createHash("sha256").update(fallbackSource).digest();
  }

  if (keyEnv.length !== 64) {
    throw new Error(
      `ENCRYPTION_KEY must be 64 hex characters (32 bytes). Current length: ${keyEnv.length}`
    );
  }

  try {
    return Buffer.from(keyEnv, "hex");
  } catch (error) {
    throw new Error(
      `ENCRYPTION_KEY must be a valid hex string. Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Generate a random 32-byte hex encryption key
 * Run this command to generate a key:
 * node -e "console.log(crypto.randomBytes(32).toString('hex'))"
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Encrypt a plaintext string using AES-256-GCM
 * Returns: iv:authTag:encryptedData (all hex encoded)
 */
export function encryptField(plaintext: string | null | undefined): string {
  if (!plaintext) {
    return ""; // Return empty string for null/undefined
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(String(plaintext), "utf8", ENCODING);
    encrypted += cipher.final(ENCODING);

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encryptedData
    return `${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error(
      `Failed to encrypt field: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Decrypt an encrypted field
 * Input format: iv:authTag:encryptedData (all hex encoded)
 */
export function decryptField(encryptedData: string | null | undefined): string {
  if (!encryptedData) {
    return ""; // Return empty string for null/undefined
  }

  try {
    const key = getEncryptionKey();

    // Parse the encrypted data format: iv:authTag:encryptedData
    const parts = String(encryptedData).split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format");
    }

    const iv = Buffer.from(parts[0], ENCODING);
    const authTag = Buffer.from(parts[1], ENCODING);
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, ENCODING, "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error(
      `Failed to decrypt field: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Check if a field value looks encrypted
 */
export function isEncrypted(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }

  // Encrypted values have format: hex:hex:hex
  const parts = String(value).split(":");
  return (
    parts.length === 3 &&
    parts[0].length === IV_LENGTH * 2 &&
    parts[1].length === AUTH_TAG_LENGTH * 2
  );
}

/**
 * Encrypt multiple fields at once
 */
export function encryptFields(
  data: Record<string, string | null | undefined>,
  fieldsToEncrypt: string[]
): Record<string, string> {
  const encrypted: Record<string, string> = { ...data };

  for (const field of fieldsToEncrypt) {
    if (field in encrypted) {
      encrypted[field] = encryptField(encrypted[field]);
    }
  }

  return encrypted;
}

/**
 * Decrypt multiple fields at once
 */
export function decryptFields(
  data: Record<string, string | null | undefined>,
  fieldsToDecrypt: string[]
): Record<string, string> {
  const decrypted: Record<string, string> = { ...data };

  for (const field of fieldsToDecrypt) {
    if (field in decrypted && isEncrypted(decrypted[field])) {
      decrypted[field] = decryptField(decrypted[field]);
    }
  }

  return decrypted;
}

/**
 * Create an encryption context for Mongoose schema
 * Usage in User model:
 *   const { getEncryptedGetter, getEncryptedSetter } = createEncryptionContext();
 *   pan: { type: String, get: getEncryptedGetter('pan'), set: getEncryptedSetter('pan') }
 */
export function createEncryptionContext(fieldsToEncrypt: string[] = []) {
  return {
    /**
     * Getter for encrypted fields - automatically decrypts when reading
     */
    getEncryptedGetter: (fieldName: string) => (value: string) => {
      if (!value) return value;
      try {
        return isEncrypted(value) ? decryptField(value) : value;
      } catch (error) {
        console.error(`Failed to decrypt ${fieldName}:`, error);
        return value; // Return original if decryption fails
      }
    },

    /**
     * Setter for encrypted fields - automatically encrypts when writing
     */
    getEncryptedSetter: (fieldName: string) => (value: string) => {
      if (!value) return value;
      try {
        // Only encrypt if not already encrypted
        return isEncrypted(value) ? value : encryptField(value);
      } catch (error) {
        console.error(`Failed to encrypt ${fieldName}:`, error);
        return value; // Return original if encryption fails
      }
    },

    /**
     * Bulk encrypt fields in document
     */
    encryptDocument: (doc: Record<string, string | null | undefined>) => {
      for (const field of fieldsToEncrypt) {
        if (doc[field]) {
          doc[field] = encryptField(doc[field]);
        }
      }
      return doc;
    },

    /**
     * Bulk decrypt fields in document
     */
    decryptDocument: (doc: Record<string, string | null | undefined>) => {
      for (const field of fieldsToEncrypt) {
        if (doc[field] && isEncrypted(doc[field])) {
          doc[field] = decryptField(doc[field]);
        }
      }
      return doc;
    },
  };
}

/**
 * Hash a field value for comparison (one-way)
 * Useful for creating unique indexes on sensitive fields
 */
export function hashField(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

/**
 * Validate encryption key format
 */
export function validateEncryptionKey(key: string): boolean {
  try {
    if (key.length !== 64) return false;
    Buffer.from(key, "hex");
    return true;
  } catch {
    return false;
  }
}
