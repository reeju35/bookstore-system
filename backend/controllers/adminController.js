const Order = require("../models/Order");
const Book = require("../models/Book");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// @desc    Get advanced admin analytics
// @route   GET /api/admin/analytics
// @access  Admin
const getAnalytics = asyncHandler(async (req, res) => {
  // ===== BASIC COUNTS =====
  const totalOrders = await Order.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalBooks = await Book.countDocuments({
    isDeleted: { $ne: true },
  });

  // ===== TOTAL REVENUE =====
  const revenueData = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
      },
    },
  ]);

  const totalRevenue =
    revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

  // ===== MONTHLY REVENUE =====
  const monthlyRevenueRaw = await Order.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { "_id": 1 } },
  ]);

  // Convert month numbers to readable format
  const monthNames = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyRevenue = monthlyRevenueRaw.map((item) => ({
    month: monthNames[item._id],
    revenue: item.revenue,
  }));

  // ===== TOP SELLING BOOKS =====
  const topBooks = await Order.aggregate([
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.title",
        totalSold: { $sum: "$orderItems.quantity" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
  ]);

  // ===== LOW STOCK BOOKS =====
  const lowStockBooks = await Book.find({
    stock: { $lte: 5 },
    isDeleted: { $ne: true },
  }).select("title stock");

  res.json({
    totalOrders,
    totalUsers,
    totalBooks,
    totalRevenue,
    monthlyRevenue,
    topBooks,
    lowStockBooks,
  });
});

module.exports = { getAnalytics };