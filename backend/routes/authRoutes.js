const express = require("express");
const rateLimit = require("express-rate-limit");
const { login, currentAdmin } = require("../controllers/authController");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many sign-in attempts. Try again in a few minutes.",
  },
});

router.post("/login", loginLimiter, login);
router.get("/me", requireAdmin, currentAdmin);

module.exports = router;
