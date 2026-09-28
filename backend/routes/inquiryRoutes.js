const express = require("express");
const rateLimit = require("express-rate-limit");
const requireAdmin = require("../middleware/requireAdmin");
const {
  createInquiry,
  listInquiries,
  updateInquiry,
  deleteInquiry,
} = require("../controllers/inquiryController");

const router = express.Router();
const publicInquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many enquiries. Please try again shortly." },
});

router.post("/", publicInquiryLimiter, createInquiry);
router.get("/", requireAdmin, listInquiries);
router.post("/manage", requireAdmin, createInquiry);
router.patch("/:id", requireAdmin, updateInquiry);
router.delete("/:id", requireAdmin, deleteInquiry);

module.exports = router;
