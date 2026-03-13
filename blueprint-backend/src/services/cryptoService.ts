import crypto from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_SIZE = 12;

function getEncryptionKey(): Buffer {
  const raw = process.env.TOKEN_ENCRYPTION_KEY || "";

  if (!raw) {
    throw new Error("TOKEN_ENCRYPTION_KEY is missing. Add a 32-byte secret in .env.");
  }

  // Accept either base64(32 bytes) or a raw passphrase (hashed to 32 bytes)
  const base64Attempt = Buffer.from(raw, "base64");
  if (base64Attempt.length === 32) {
    return base64Attempt;
  }

  return crypto.createHash("sha256").update(raw).digest();
}

export function encryptToken(plainText: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_SIZE);
  const cipher = crypto.createCipheriv(ALGO, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptToken(cipherText: string): string {
  const key = getEncryptionKey();
  const [ivB64, tagB64, dataB64] = cipherText.split(":");

  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Encrypted token format is invalid.");
  }

  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const encrypted = Buffer.from(dataB64, "base64");

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
