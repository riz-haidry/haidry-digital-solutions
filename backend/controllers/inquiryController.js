const Customer = require("../models/Customer");
const Inquiry = require("../models/Inquiry");

async function createInquiry(req, res) {
  const name = String(req.body.name ?? "").trim();
  const phone = String(req.body.phone ?? "").trim();
  const email = String(req.body.email ?? "")
    .trim()
    .toLowerCase();
  const service = String(req.body.service ?? "").trim();
  const message = String(req.body.message ?? "").trim();

  if (!name || !phone || !service)
    return res
      .status(400)
      .json({ message: "Name, phone and service are required." });
  if (
    name.length > 120 ||
    phone.length > 32 ||
    email.length > 180 ||
    service.length > 100 ||
    message.length > 4000
  ) {
    return res
      .status(400)
      .json({ message: "One or more fields are too long." });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res
      .status(400)
      .json({ message: "Please enter a valid email address." });

  const customerQuery = [{ phone }];
  if (email) customerQuery.push({ email });
  let customer = await Customer.findOne({ $or: customerQuery });
  if (customer) {
    if (email) {
      const emailOwner = await Customer.exists({
        email,
        _id: { $ne: customer._id },
      });
      if (emailOwner)
        return res
          .status(409)
          .json({
            message:
              "That email is already linked to another customer. Please check the details.",
          });
    }
    customer.name = name;
    customer.phone = phone;
    if (email) customer.email = email;
    await customer.save();
  } else {
    customer = await Customer.create({
      name,
      phone,
      ...(email ? { email } : {}),
    });
  }

  const inquiry = await Inquiry.create({
    customer: customer._id,
    name,
    phone,
    email,
    service,
    message,
  });
  return res
    .status(201)
    .json({
      message: "Thanks — your enquiry has been received.",
      data: inquiry,
    });
}

async function listInquiries(req, res) {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 50),
  );
  const [data, total] = await Promise.all([
    Inquiry.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Inquiry.countDocuments(),
  ]);
  return res.json({
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

async function updateInquiry(req, res) {
  const data = await Inquiry.findById(req.params.id);
  if (!data) return res.status(404).json({ message: "Enquiry not found." });
  const name = String(req.body.name ?? data.name).trim();
  const phone = String(req.body.phone ?? data.phone).trim();
  const email = String(req.body.email ?? data.email ?? "")
    .trim()
    .toLowerCase();
  const service = String(req.body.service ?? data.service).trim();
  const message = String(req.body.message ?? data.message ?? "").trim();
  const status = req.body.status ?? data.status;
  if (!name || !phone || !service)
    return res
      .status(400)
      .json({ message: "Name, phone and service are required." });
  if (
    name.length > 120 ||
    phone.length > 32 ||
    email.length > 180 ||
    service.length > 100 ||
    message.length > 4000
  )
    return res
      .status(400)
      .json({ message: "One or more fields are too long." });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res
      .status(400)
      .json({ message: "Please enter a valid email address." });
  if (!["new", "contacted", "qualified", "closed"].includes(status))
    return res.status(400).json({ message: "Choose a valid enquiry status." });

  const customer = await Customer.findById(data.customer);
  if (customer) {
    if (email) {
      const emailOwner = await Customer.exists({
        email,
        _id: { $ne: customer._id },
      });
      if (emailOwner)
        return res
          .status(409)
          .json({
            message: "That email is already linked to another customer.",
          });
      customer.email = email;
    } else customer.email = undefined;
    customer.name = name;
    customer.phone = phone;
    await customer.save();
  }
  Object.assign(data, { name, phone, email, service, message, status });
  await data.save();
  return res.json({ data: data.toObject() });
}

async function deleteInquiry(req, res) {
  const data = await Inquiry.findByIdAndDelete(req.params.id).lean();
  if (!data) return res.status(404).json({ message: "Enquiry not found." });
  return res.json({ message: "Enquiry deleted." });
}

module.exports = { createInquiry, listInquiries, updateInquiry, deleteInquiry };
