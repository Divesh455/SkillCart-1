/**
 * Backend Resume API Routes Structure
 * Endpoints for Resume Upload & Resume Generation / Creation
 * 
 * TODO: Replace with production auth
 * TODO: Handle token securely (cookies/localStorage later)
 * TODO: Backend API (friend's server)
 * DO NOT CHANGE THIS ENDPOINT
 */

const express = require("express");
const router = express.Router();

/**
 * Middleware: Extract and verify Authorization Bearer token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication token missing from request headers.",
    });
  }

  // TODO: Fix token handling properly - verify JWT signature
  req.userToken = token;
  next();
};

/**
 * 1. RESUME UPLOAD ENDPOINT
 * POST /api/v1/resume/upload
 * Accepts multipart file payload (file / resume)
 */
router.post("/upload", authenticateToken, (req, res) => {
  try {
    // Structure for handling file storage & extraction
    // TODO: Process PDF/DOC file and extract candidate skills/experience
    const mockFileResponse = {
      id: "res_" + Date.now(),
      status: "success",
      message: "Resume uploaded successfully to backend server",
      createdAt: new Date().toISOString(),
    };

    return res.status(200).json(mockFileResponse);
  } catch (error) {
    return res.status(500).json({
      error: "InternalServerError",
      message: error.message || "Failed to process resume upload.",
    });
  }
});

/**
 * 2. RESUME CREATE (MANUAL FORM) ENDPOINT
 * POST /api/v1/resume/generate
 * Accepts candidate JSON payload (contact, education, experience, projects, skills, certifications)
 */
router.post("/generate", authenticateToken, (req, res) => {
  try {
    const candidateData = req.body;

    // Structure for creating candidate resume record in backend DB
    // TODO: Validate candidate schema & persist to database
    const mockGenerateResponse = {
      id: "res_" + Date.now(),
      status: "success",
      message: "Resume profile created successfully",
      name: candidateData?.name || "Candidate",
      createdAt: new Date().toISOString(),
    };

    return res.status(200).json(mockGenerateResponse);
  } catch (error) {
    return res.status(500).json({
      error: "InternalServerError",
      message: error.message || "Failed to generate resume record.",
    });
  }
});

/**
 * 3. CAREER MATCH ENDPOINT
 * GET /api/v1/career/match
 * GET /career/match
 * Returns array of matched job IDs for Flash Card stack
 */
router.get(["/career/match", "/match"], (req, res) => {
  try {
    // Array of matched job IDs from candidate profile
    const matchedJobIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return res.status(200).json({
      status: "success",
      matched_jobs: matchedJobIds,
      ids: matchedJobIds,
    });
  } catch (error) {
    return res.status(500).json({
      error: "InternalServerError",
      message: error.message || "Failed to fetch career matches.",
    });
  }
});

module.exports = router;
