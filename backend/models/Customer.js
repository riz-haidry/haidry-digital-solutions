const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 32, index: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 180,
      sparse: true,
      unique: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Customer", customerSchema);
