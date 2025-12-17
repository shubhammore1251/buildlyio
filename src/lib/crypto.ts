// import crypto from "crypto";

// const ALGO = "aes-256-gcm";
// const KEY = Buffer.from(process.env.CRYPTO_SECRET_KEY!, "hex");

// export function encrypt(text: string) {
//   const iv = crypto.randomBytes(12);
//   const cipher = crypto.createCipheriv(ALGO, KEY, iv);

//   const encrypted = Buffer.concat([
//     cipher.update(text, "utf8"),
//     cipher.final(),
//   ]);

//   const tag = cipher.getAuthTag();

//   return Buffer.concat([iv, tag, encrypted]).toString("base64");
// }

// export function decrypt(payload: string) {
//   const data = Buffer.from(payload, "base64");

//   const iv = data.subarray(0, 12);
//   const tag = data.subarray(12, 28);
//   const encrypted = data.subarray(28);

//   const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
//   decipher.setAuthTag(tag);

//   return decipher.update(encrypted) + decipher.final("utf8");
// }

export function encrypt(text: string) {

  return "";
}

export function decrypt(payload: string) {
  return "";
}