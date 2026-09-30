const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const STUDIO_ADMIN = {
  name: "Rizwan Haidry",
  email: "rizwan2husain@gmail.com",
  password: "Rizwan9325281316",
};

async function ensureAdmin() {
  const email = STUDIO_ADMIN.email.toLowerCase();
  const passwordHash = await bcrypt.hash(STUDIO_ADMIN.password, 12);

  await Admin.findOneAndUpdate(
    { email },
    {
      email,
      name: STUDIO_ADMIN.name,
      passwordHash,
      role: "admin",
      active: true,
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );

  console.info(`Admin account ready for ${email}`);
}

module.exports = ensureAdmin;
