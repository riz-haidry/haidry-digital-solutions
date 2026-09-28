require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const connectDatabase = require("../config/database");

async function createAdmin() {
  const email = String(process.env.ADMIN_EMAIL ?? "")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = String(process.env.ADMIN_NAME ?? "Administrator").trim();
  if (!email || password.length < 12)
    throw new Error(
      "Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters in backend/.env.",
    );

  await connectDatabase();
  const passwordHash = await bcrypt.hash(password, 12);
  await Admin.findOneAndUpdate(
    { email },
    { email, name, passwordHash, role: "admin", active: true },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
  console.info(`Admin account ready for ${email}`);
}

createAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
