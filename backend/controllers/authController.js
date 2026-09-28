const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

async function login(req, res) {
  const email = String(req.body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(req.body.password ?? "");
  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Email and password are required." });

  const admin = await Admin.findOne({ email }).select("+passwordHash");
  if (
    !admin ||
    !admin.active ||
    !(await bcrypt.compare(password, admin.passwordHash))
  ) {
    return res.status(401).json({ message: "Email or password is incorrect." });
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    return res
      .status(500)
      .json({ message: "Admin authentication is not configured." });
  }

  const token = jwt.sign(
    { sub: admin.id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );
  return res.json({
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email },
  });
}

function currentAdmin(req, res) {
  return res.json({
    admin: { id: req.admin.id, name: req.admin.name, email: req.admin.email },
  });
}

module.exports = { login, currentAdmin };
