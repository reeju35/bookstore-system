const express = require("express");
const router = express.Router();

const {
  createOrder,
  createRazorpayOrder,
  verifyPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderById
} = require("../controllers/orderController");

const { protect, admin } = require("../middleware/authMiddleware");

/* ================= CREATE ORDER ================= */
router.post("/", protect, createOrder);

/* ================= CREATE PAYMENT ================= */
router.post("/create-payment", protect, createRazorpayOrder);

/* ================= VERIFY PAYMENT ================= */
router.post("/verify-payment", protect, verifyPayment);

/* ================= GET USER ORDERS ================= */
router.get("/myorders", protect, getMyOrders);

/* ================= GET ALL ORDERS (ADMIN) ================= */
router.get("/", protect, admin, getAllOrders);

/* ================= GET SINGLE ORDER ================= */
router.get("/:id", protect, getOrderById);

/* ================= UPDATE ORDER STATUS ================= */
router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;