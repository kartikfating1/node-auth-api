import * as crypto from "crypto";

const secret = "peopleanalytics-#$!%-$#@%";
const algorithm = "aes-256-cbc";

// Derive a 32-byte key from the secret using scrypt (recommended)
const key = crypto.scryptSync(secret, "salt", 32);

/**
 * Encrypt plaintext using AES-256-CBC
 */
const encrypt = (plaintext: string): string => {
  const iv = crypto.randomBytes(16); // Generate a random initialization vector
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Prepend IV to the ciphertext so it can be used for decryption
  return iv.toString("hex") + ":" + encrypted;
};

/**
 * Decrypt ciphertext using AES-256-CBC
 */
const decrypt = (ciphertext: string): string => {
  const [ivHex, encryptedData] = ciphertext.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

const config = {
  secret,
  jwtExpiration: 86400, // 24 hours
  jwtRefreshExpiration: 86400, // 24 hours
  encrypt,
  decrypt,
};

export default config;
