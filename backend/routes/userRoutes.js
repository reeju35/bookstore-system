const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserProfile,       // ✅ added
  updateUserProfile     // ✅ added
} = require("../controllers/userController");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User Authentication & Profile APIs
 */


/* ================= AUTH ROUTES ================= */

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logoutUser);


/* ================= PROFILE ROUTES ================= */

// @desc Get logged-in user profile
// @route GET /api/profile
// @access Private
router.get("/profile", protect, getUserProfile);

// @desc Update logged-in user profile
// @route PUT /api/profile
// @access Private
router.put("/profile", protect, updateUserProfile);


module.exports = router;