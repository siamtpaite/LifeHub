const crypto = require("crypto");

function validateSecretKey(secretKey) {
  if (!secretKey || !/^[0-9a-fA-F]{64}$/.test(secretKey)) {
    throw new Error("Invalid ENCRYPTION_KEY. Must be 64 hex characters.");
  }
}

function encryptData(data, secretKey) {
  validateSecretKey(secretKey);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(secretKey, "hex"), iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
}

function decryptData(encryptedData, iv, secretKey) {
  validateSecretKey(secretKey);
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(secretKey, "hex"), Buffer.from(iv, "hex"));
  let decrypted = decipher.update(Buffer.from(encryptedData, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString("utf8"));
}

module.exports = { encryptData, decryptData };
