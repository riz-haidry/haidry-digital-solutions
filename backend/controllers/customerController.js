const Customer = require("../models/Customer");
const Inquiry = require("../models/Inquiry");
const Order = require("../models/Order");

function customerFields(body = {}) {
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  if (!name) return { error: "Customer name is required." };
  if (name.length > 120 || phone.length > 32 || email.length > 180)
    return { error: "One or more fields are too long." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "Please enter a valid email address." };
  return { name, phone, email };
}

async function listCustomers(req, res) {
  const data = await Customer.find().sort({ updatedAt: -1 }).limit(200).lean();
  return res.json({ data });
}

async function createCustomer(req, res) {
  const fields = customerFields(req.body);
  if (fields.error) return res.status(400).json({ message: fields.error });
  const data = await Customer.create({
    name: fields.name,
    phone: fields.phone,
    ...(fields.email ? { email: fields.email } : {}),
  });
  return res.status(201).json({ data });
}

async function updateCustomer(req, res) {
  const fields = customerFields(req.body);
  if (fields.error) return res.status(400).json({ message: fields.error });
  const current = await Customer.findById(req.params.id);
  if (!current) return res.status(404).json({ message: "Customer not found." });
  if (fields.email) {
    const emailOwner = await Customer.exists({
      email: fields.email,
      _id: { $ne: current._id },
    });
    if (emailOwner)
      return res
        .status(409)
        .json({ message: "That email is already used by another customer." });
    current.email = fields.email;
  } else current.email = undefined;
  current.name = fields.name;
  current.phone = fields.phone;
  const data = await current.save();
  return res.json({ data });
}

async function deleteCustomer(req, res) {
  const customer = await Customer.findById(req.params.id);
  if (!customer)
    return res.status(404).json({ message: "Customer not found." });
  const [hasOrders, hasInquiries] = await Promise.all([
    Order.exists({ customer: customer._id }),
    Inquiry.exists({ customer: customer._id }),
  ]);
  if (hasOrders || hasInquiries)
    return res
      .status(409)
      .json({
        message:
          "This customer has linked projects or enquiries. Remove those records first.",
      });
  await customer.deleteOne();
  return res.json({ message: "Customer deleted." });
}

module.exports = {
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
