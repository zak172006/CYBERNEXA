
const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  register,
  login
} = require("../controllers/authController");

const router = express.Router();

// Limit authentication attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later."
  }
});

// Registration endpoint
router.post("/register", authLimiter, register);

// Login endpoint
router.post("/login", authLimiter, login);

module.exports = router;
