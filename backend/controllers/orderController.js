const Order = require("../models/Order");
const Book = require("../models/Book");
const asyncHandler = require("express-async-handler");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");
const logActivity = require("../utils/logActivity");

const Razorpay = require("razorpay");
const crypto = require("crypto");

/* ================= CREATE ORDER ================= */

// @desc Create new order
// @route POST /api/orders
// @access Protected (Customer)
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  let totalPrice = 0;
  const validatedItems = [];

  for (const item of orderItems) {
    const book = await Book.findById(item.book);

    if (!book) {
      res.status(404);
      throw new Error("Book not found");
    }

    // Atomic stock update
    const updatedBook = await Book.findOneAndUpdate(
      { _id: item.book, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true }
    );

    if (!updatedBook) {
      res.status(400);
      throw new Error(`Not enough stock for ${book.title}`);
    }

    totalPrice += book.price * item.quantity;

    validatedItems.push({
      book: book._id,
      title: book.title,
      quantity: item.quantity,
      price: book.price,
    });
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems: validatedItems,
    totalPrice,
    status: "Pending",
    paymentStatus: "Pending",
    statusHistory: [
      {
        status: "Pending",
        changedBy: req.user._id,
      },
    ],
  });

  res.status(201).json(order);
});

/* ================= CREATE RAZORPAY ORDER ================= */

// @desc Create Razorpay Order
// @route POST /api/orders/create-payment
// @access Protected
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const options = {
    amount: amount * 100, // ₹ to paisa
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  const razorpayOrder = await razorpay.orders.create(options);

  res.json(razorpayOrder);
});

/* ================= VERIFY PAYMENT ================= */

// @desc Verify Razorpay Payment
// @route POST /api/orders/verify-payment
// @access Protected
const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error("Payment verification failed");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.paymentStatus = "Paid";
  order.status = "Processing";
  order.paidAt = Date.now();

  order.statusHistory.push({
    status: "Processing",
    changedBy: req.user._id,
  });

  await order.save();

  const user = await User.findById(order.user);

  await sendEmail({
    email: user.email,
    subject: "Payment Successful - Bookstore",
    message: `Hello ${user.name},

Your payment was successful.

Order ID: ${order._id}
Amount Paid: ₹${order.totalPrice}

Thank you for shopping with us!`,
  });

  res.json({ success: true });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let filter = { user: req.user._id };

  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(new Date(endDate).setHours(23, 59, 59)),
    };
  } else {
    // Default: today only
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    filter.createdAt = { $gte: start, $lte: end };
  }

  const orders = await Order.find(filter);
  res.json(orders);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let filter = {};

  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(new Date(endDate).setHours(23, 59, 59)),
    };
  } else {
    // Default: today only
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    filter.createdAt = { $gte: start, $lte: end };
  }

  const orders = await Order.find(filter).populate("user", "name email");
  res.json(orders);
});

/* ================= UPDATE ORDER STATUS ================= */

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (status && status !== order.status) {
    order.status = status;

    order.statusHistory.push({
      status,
      changedBy: req.user._id,
    });
  }

  const updatedOrder = await order.save();

  await logActivity(
    req.user._id,
    "UPDATE_ORDER_STATUS",
    order._id,
    `Order status changed to ${order.status}`
  );

  res.json(updatedOrder);
});

/* ================= GET SINGLE ORDER ================= */

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (
    req.user.role !== "admin" &&
    order.user._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  res.json(order);
});

module.exports = {
  createOrder,
  createRazorpayOrder,
  verifyPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
};