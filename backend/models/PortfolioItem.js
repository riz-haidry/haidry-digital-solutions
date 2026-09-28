const mongoose = require("mongoose");

const portfolioItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    mediaType: { type: String, enum: ["image", "video"], required: true },
    mediaUrl: { type: String, required: true },
    mimeType: { type: String, required: true },
    displayWidth: { type: Number, min: 240, max: 3840, default: 1200 },
    displayHeight: { type: Number, min: 240, max: 3840, default: 800 },
    fitMode: { type: String, enum: ["cover", "contain"], default: "cover" },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PortfolioItem", portfolioItemSchema);
