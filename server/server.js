/**
 * Backend Server Structure
 * 
 * TODO: Replace with production auth
 * TODO: Handle token securely (cookies/localStorage later)
 * TODO: Backend API (friend's server)
 * DO NOT CHANGE THIS ENDPOINT
 */

const express = require("express");
const cors = require("cors");
const resumeRoutes = require("./routes/resumeRoutes");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register Resume API Endpoints
// 1. Resume Upload: POST /api/v1/resume/upload
// 2. Resume Create: POST /api/v1/resume/generate
app.use("/api/v1/resume", resumeRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend server structure listening on port ${PORT}`);
  });
}

module.exports = app;
