
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Allow frontend requests
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5500"
  })
);

// Parse JSON requests
app.use(express.json({ limit: "10kb" }));

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

app.use("/api", apiLimiter);

// Welcome route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to CYBERNEXA API",
    version: "1.0.0"
  });
});

// Server health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`CYBERNEXA API running on port ${PORT}`);
});
