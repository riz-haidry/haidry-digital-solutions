const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

async function ensureAdmin() {
  const email = String(process.env.ADMIN_EMAIL ?? "")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = String(process.env.ADMIN_NAME ?? "Administrator").trim();

  if (!email || password.length < 12) {
    const message =
      "Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters so the admin account can be created on deploy.";
    if (process.env.NODE_ENV === "production") throw new Error(message);
    console.warn(message);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await Admin.findOneAndUpdate(
    { email },
    { email, name, passwordHash, role: "admin", active: true },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
  console.info(`Admin account ready for ${email}`);
}

module.exports = ensureAdmin;
