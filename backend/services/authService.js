const jwt = require("jsonwebtoken");

function generateToken(userId, tenantId, role) {
  const payload = { userId, tenantId, role };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { generateToken, verifyToken };
