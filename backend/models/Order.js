const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    service: { type: String, required: true, trim: true, maxlength: 100 },
    notes: { type: String, trim: true, maxlength: 4000, default: "" },
    amount: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: ["draft", "in-progress", "review", "complete", "cancelled"],
      default: "draft",
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
