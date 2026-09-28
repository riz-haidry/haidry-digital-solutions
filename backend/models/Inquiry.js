const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 32 },
    email: { type: String, trim: true, lowercase: true, maxlength: 180 },
    service: { type: String, required: true, trim: true, maxlength: 100 },
    message: { type: String, trim: true, maxlength: 4000, default: "" },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "closed"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Inquiry", inquirySchema);
