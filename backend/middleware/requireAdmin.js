const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

async function requireAdmin(req, res, next) {
  const header = req.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Sign in to continue." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(payload.sub).select(
      "_id email name active",
    );
    if (!admin || !admin.active)
      return res
        .status(401)
        .json({ message: "This admin session is no longer valid." });
    req.admin = admin;
    return next();
  } catch {
    return res
      .status(401)
      .json({ message: "Your session has expired. Sign in again." });
  }
}

module.exports = requireAdmin;
