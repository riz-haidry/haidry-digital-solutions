const express = require("express");
const requireAdmin = require("../middleware/requireAdmin");
const {
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const router = express.Router();
router.get("/", requireAdmin, listCustomers);
router.post("/", requireAdmin, createCustomer);
router.patch("/:id", requireAdmin, updateCustomer);
router.delete("/:id", requireAdmin, deleteCustomer);

module.exports = router;
