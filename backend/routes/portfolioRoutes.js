const express = require("express");
const requireAdmin = require("../middleware/requireAdmin");
const {
  listPublicPortfolio,
  listManagePortfolio,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} = require("../controllers/portfolioController");

const router = express.Router();
router.get("/", listPublicPortfolio);
router.get("/manage", requireAdmin, listManagePortfolio);
router.post(
  "/",
  requireAdmin,
  express.json({ limit: "36mb" }),
  createPortfolioItem,
);
router.patch(
  "/:id",
  requireAdmin,
  express.json({ limit: "36mb" }),
  updatePortfolioItem,
);
router.delete("/:id", requireAdmin, deletePortfolioItem);

module.exports = router;
