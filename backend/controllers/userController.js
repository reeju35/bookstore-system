const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const {
  registerValidation,
  loginValidation
} = require("../validators/userValidator");


// ================= TOKEN GENERATORS =================

// Access token (short life)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Refresh token (long life)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};


// ================= REGISTER =================

// @desc Register new user
// @route POST /api/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {

  // 🔥 Joi validation
  const { error } = registerValidation(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});


// ================= LOGIN =================

// @desc Login user
// @route POST /api/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {

  // 🔥 Joi validation
  const { error } = loginValidation(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
    });

  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});


// ================= REFRESH ACCESS TOKEN =================

// @desc Refresh access token
// @route POST /api/refresh-token
// @access Public
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401);
    throw new Error("No refresh token provided");
  }

  const user = await User.findOne({ refreshToken });

  if (!user) {
    res.status(403);
    throw new Error("Invalid refresh token");
  }

  try {
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = generateAccessToken(user._id);

    res.json({ accessToken: newAccessToken });

  } catch (error) {
    res.status(403);
    throw new Error("Refresh token expired or invalid");
  }
});


// ================= LOGOUT =================

// @desc Logout user
// @route POST /api/logout
// @access Public
const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const user = await User.findOne({ refreshToken });

  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.json({ message: "Logged out successfully" });
});
// ================= GET USER PROFILE =================

// @desc Get logged in user profile
// @route GET /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});


// ================= UPDATE USER PROFILE =================

// @desc Update logged in user profile
// @route PUT /api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
  });
});


module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserProfile,
  updateUserProfile
};
