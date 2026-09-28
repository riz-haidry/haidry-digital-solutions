const express = require("express");
const requireAdmin = require("../middleware/requireAdmin");
const {
  listOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

const router = express.Router();
router.use(requireAdmin);
router.get("/", listOrders);
router.post("/", createOrder);
router.patch("/:id", updateOrder);
router.delete("/:id", deleteOrder);

module.exports = router;
