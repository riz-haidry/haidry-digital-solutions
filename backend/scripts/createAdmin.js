require("dotenv").config();
const mongoose = require("mongoose");
const connectDatabase = require("../config/database");
const ensureAdmin = require("../utils/ensureAdmin");

async function createAdmin() {
  await connectDatabase();
  await ensureAdmin();
}

createAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
