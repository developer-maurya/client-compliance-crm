const express = require("express");

const {
  getComplianceReport,
} = require("../controllers/reportController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==================================
// COMPLIANCE REPORT
// Any logged-in user
// ==================================
router.get(
  "/compliance",
  protect,
  getComplianceReport
);

module.exports = router;