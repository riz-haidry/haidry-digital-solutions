const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const PortfolioItem = require("../models/PortfolioItem");
const { readVideoDuration } = require("../utils/videoDuration");

const uploadDirectory = path.join(__dirname, "..", "uploads", "portfolio");
const MIME_EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};
const MAX_BYTES = { image: 10 * 1024 * 1024, video: 25 * 1024 * 1024 };
const MAX_VIDEO_SECONDS = 15;
const DATA_URI =
  /^data:(image\/(?:jpeg|png|webp)|video\/(?:mp4|webm));base64,([A-Za-z0-9+/]+={0,2})$/;

async function listPublicPortfolio(req, res) {
  const data = await PortfolioItem.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .lean();
  return res.json({ data });
}

async function listManagePortfolio(req, res) {
  const data = await PortfolioItem.find().sort({ createdAt: -1 }).lean();
  return res.json({ data });
}

async function createPortfolioItem(req, res) {
  const title = String(req.body.title ?? "").trim();
  const category = String(req.body.category ?? "").trim();
  const description = String(req.body.description ?? "").trim();
  const isPublished = req.body.isPublished !== false;
  const displayWidth = Number(req.body.displayWidth ?? 1200);
  const displayHeight = Number(req.body.displayHeight ?? 800);
  const fitMode = req.body.fitMode ?? "cover";

  if (!title || !category)
    return res
      .status(400)
      .json({ message: "Title and category are required." });
  if (title.length > 120 || category.length > 60 || description.length > 500)
    return res
      .status(400)
      .json({ message: "Please shorten the project details and try again." });
  if (
    !Number.isInteger(displayWidth) ||
    displayWidth < 240 ||
    displayWidth > 3840 ||
    !Number.isInteger(displayHeight) ||
    displayHeight < 240 ||
    displayHeight > 3840
  )
    return res
      .status(400)
      .json({
        message:
          "Display width and height must be between 240 and 3840 pixels.",
      });
  if (!["cover", "contain"].includes(fitMode))
    return res
      .status(400)
      .json({ message: "Choose either crop to fill or fit entire media." });
  if (typeof req.body.fileData !== "string")
    return res
      .status(400)
      .json({ message: "Choose an image or video to upload." });

  const match = DATA_URI.exec(req.body.fileData);
  if (!match)
    return res
      .status(400)
      .json({ message: "Use a JPG, PNG, WebP, MP4 or WebM file." });
  const mimeType = match[1];
  const mediaType = mimeType.startsWith("image/") ? "image" : "video";
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > MAX_BYTES[mediaType])
    return res
      .status(413)
      .json({
        message:
          "This " +
          mediaType +
          " exceeds the " +
          (mediaType === "image" ? "10 MB" : "25 MB") +
          " upload limit.",
      });

  if (mediaType === "video") {
    const duration = readVideoDuration(buffer, mimeType);
    if (!duration)
      return res
        .status(400)
        .json({
          message:
            "Could not verify this video duration. Export it as a standard MP4 or WebM and try again.",
        });
    if (duration > MAX_VIDEO_SECONDS)
      return res
        .status(400)
        .json({ message: "Videos must be 15 seconds or shorter." });
  }

  const filename = crypto.randomUUID() + MIME_EXTENSIONS[mimeType];
  await fs.mkdir(uploadDirectory, { recursive: true });
  await fs.writeFile(path.join(uploadDirectory, filename), buffer, {
    flag: "wx",
  });
  try {
    const item = await PortfolioItem.create({
      title,
      category,
      description,
      mediaType,
      mimeType,
      displayWidth,
      displayHeight,
      fitMode,
      mediaUrl: "/uploads/portfolio/" + filename,
      isPublished,
    });
    return res
      .status(201)
      .json({ message: "Portfolio work uploaded.", data: item });
  } catch (error) {
    await fs.unlink(path.join(uploadDirectory, filename)).catch(() => {});
    throw error;
  }
}

async function updatePortfolioItem(req, res) {
  const item = await PortfolioItem.findById(req.params.id);
  if (!item)
    return res.status(404).json({ message: "Portfolio work not found." });
  const update = {};
  for (const field of ["title", "category", "description"]) {
    if (req.body[field] !== undefined)
      update[field] = String(req.body[field]).trim();
  }
  if (
    update.title !== undefined &&
    (!update.title || update.title.length > 120)
  )
    return res
      .status(400)
      .json({
        message: "Title is required and must be 120 characters or fewer.",
      });
  if (
    update.category !== undefined &&
    (!update.category || update.category.length > 60)
  )
    return res
      .status(400)
      .json({
        message: "Category is required and must be 60 characters or fewer.",
      });
  if (update.description !== undefined && update.description.length > 500)
    return res
      .status(400)
      .json({ message: "Description must be 500 characters or fewer." });
  if (req.body.isPublished !== undefined) {
    if (typeof req.body.isPublished !== "boolean")
      return res
        .status(400)
        .json({ message: "Choose whether to publish this work." });
    update.isPublished = req.body.isPublished;
  }
  if (
    req.body.displayWidth !== undefined ||
    req.body.displayHeight !== undefined
  ) {
    const displayWidth = Number(req.body.displayWidth ?? item.displayWidth);
    const displayHeight = Number(req.body.displayHeight ?? item.displayHeight);
    if (
      !Number.isInteger(displayWidth) ||
      displayWidth < 240 ||
      displayWidth > 3840 ||
      !Number.isInteger(displayHeight) ||
      displayHeight < 240 ||
      displayHeight > 3840
    )
      return res
        .status(400)
        .json({
          message:
            "Display width and height must be between 240 and 3840 pixels.",
        });
    update.displayWidth = displayWidth;
    update.displayHeight = displayHeight;
  }
  if (req.body.fitMode !== undefined) {
    if (!["cover", "contain"].includes(req.body.fitMode))
      return res
        .status(400)
        .json({ message: "Choose either crop to fill or fit entire media." });
    update.fitMode = req.body.fitMode;
  }

  let newFilePath = "";
  let oldMediaUrl = "";
  if (req.body.fileData !== undefined) {
    if (typeof req.body.fileData !== "string")
      return res
        .status(400)
        .json({ message: "Choose a supported image or video." });
    const match = DATA_URI.exec(req.body.fileData);
    if (!match)
      return res
        .status(400)
        .json({ message: "Use a JPG, PNG, WebP, MP4 or WebM file." });
    const mimeType = match[1];
    const mediaType = mimeType.startsWith("image/") ? "image" : "video";
    const buffer = Buffer.from(match[2], "base64");
    if (!buffer.length || buffer.length > MAX_BYTES[mediaType])
      return res
        .status(413)
        .json({
          message:
            "This " +
            mediaType +
            " exceeds the " +
            (mediaType === "image" ? "10 MB" : "25 MB") +
            " upload limit.",
        });
    if (mediaType === "video") {
      const duration = readVideoDuration(buffer, mimeType);
      if (!duration)
        return res
          .status(400)
          .json({
            message:
              "Could not verify this video duration. Export it as a standard MP4 or WebM and try again.",
          });
      if (duration > MAX_VIDEO_SECONDS)
        return res
          .status(400)
          .json({ message: "Videos must be 15 seconds or shorter." });
    }
    const filename = crypto.randomUUID() + MIME_EXTENSIONS[mimeType];
    await fs.mkdir(uploadDirectory, { recursive: true });
    newFilePath = path.join(uploadDirectory, filename);
    await fs.writeFile(newFilePath, buffer, { flag: "wx" });
    oldMediaUrl = item.mediaUrl;
    Object.assign(update, {
      mediaType,
      mimeType,
      mediaUrl: "/uploads/portfolio/" + filename,
    });
  }

  try {
    Object.assign(item, update);
    await item.save();
  } catch (error) {
    if (newFilePath) await fs.unlink(newFilePath).catch(() => {});
    throw error;
  }
  if (oldMediaUrl)
    await fs
      .unlink(path.join(uploadDirectory, path.basename(oldMediaUrl)))
      .catch((error) => {
        if (error.code !== "ENOENT")
          console.error(
            "Could not remove replaced portfolio media:",
            error.message,
          );
      });
  return res.json({ data: item.toObject() });
}

async function deletePortfolioItem(req, res) {
  const item = await PortfolioItem.findByIdAndDelete(req.params.id).lean();
  if (!item)
    return res.status(404).json({ message: "Portfolio work not found." });
  await fs
    .unlink(path.join(uploadDirectory, path.basename(item.mediaUrl)))
    .catch((error) => {
      if (error.code !== "ENOENT")
        console.error("Could not remove portfolio media:", error.message);
    });
  return res.json({ message: "Portfolio work deleted." });
}

module.exports = {
  listPublicPortfolio,
  listManagePortfolio,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
};
