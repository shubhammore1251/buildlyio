// src/lib/crypto.ts
import "server-only";
import crypto from "crypto";

const ALGO = "aes-256-gcm";

// derive a fixed 32-byte key from ANY string
const KEY = crypto
  .createHash("sha256")
  .update(process.env.CRYPTO_SECRET_KEY!)
  .digest(); // 32 bytes

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12); // required for gcm
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // iv (12) + tag (16) + ciphertext
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt(payload: string): string {
  const data = Buffer.from(payload, "base64");

  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);

  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);

  return decipher.update(encrypted, undefined, "utf8") + decipher.final("utf8");
}
