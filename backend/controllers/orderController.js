const mongoose = require("mongoose");
const Order = require("../models/Order");
const Customer = require("../models/Customer");

async function listOrders(req, res) {
  const data = await Order.find()
    .populate("customer", "name email phone")
    .sort({ updatedAt: -1 })
    .limit(200)
    .lean();
  return res.json({ data });
}

async function createOrder(req, res) {
  const {
    customer,
    title,
    service,
    notes = "",
    amount = 0,
    status = "draft",
  } = req.body;
  if (!mongoose.isValidObjectId(customer))
    return res.status(400).json({ message: "Choose a valid customer." });
  if (!(await Customer.exists({ _id: customer })))
    return res
      .status(400)
      .json({ message: "That customer record no longer exists." });
  if (!String(title ?? "").trim() || !String(service ?? "").trim())
    return res
      .status(400)
      .json({ message: "Project title and service are required." });
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount < 0)
    return res
      .status(400)
      .json({ message: "Enter a valid non-negative amount." });
  const record = await Order.create({
    customer,
    title: String(title).trim(),
    service: String(service).trim(),
    notes,
    amount: numericAmount,
    status,
  });
  const data = await Order.findById(record._id)
    .populate("customer", "name email phone")
    .lean();
  return res.status(201).json({ data });
}

async function updateOrder(req, res) {
  const { customer, title, service, status, amount, notes } = req.body;
  const update = {};
  if (customer !== undefined) {
    if (!mongoose.isValidObjectId(customer))
      return res.status(400).json({ message: "Choose a valid customer." });
    if (!(await Customer.exists({ _id: customer })))
      return res
        .status(400)
        .json({ message: "That customer record no longer exists." });
    update.customer = customer;
  }
  if (title !== undefined) update.title = String(title).trim();
  if (service !== undefined) update.service = String(service).trim();
  if (status !== undefined) update.status = status;
  if (amount !== undefined) {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 0)
      return res
        .status(400)
        .json({ message: "Enter a valid non-negative amount." });
    update.amount = numericAmount;
  }
  if (notes !== undefined) update.notes = notes;
  const data = await Order.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  })
    .populate("customer", "name email phone")
    .lean();
  if (!data) return res.status(404).json({ message: "Project not found." });
  return res.json({ data });
}

async function deleteOrder(req, res) {
  const data = await Order.findByIdAndDelete(req.params.id).lean();
  if (!data) return res.status(404).json({ message: "Project not found." });
  return res.json({ message: "Project deleted." });
}

module.exports = { listOrders, createOrder, updateOrder, deleteOrder };
