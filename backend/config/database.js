const mongoose = require("mongoose");

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri)
    throw new Error(
      "MONGODB_URI is required. Copy .env.example to .env and configure the database.",
    );
  await mongoose.connect(uri);
  console.info(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = connectDatabase;
