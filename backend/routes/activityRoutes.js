const express = require("express");

const {
  createActivity,
  getClientActivities,
  getFollowUpSummary,
  updateActivity,
  completeActivity,
  deleteActivity,
} = require("../controllers/activityController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ==================================
// CREATE FOLLOW-UP
// ==================================
router.post(
  "/",
  protect,
  createActivity
);

// ==================================
// FOLLOW-UP SUMMARY
// ==================================
router.get(
  "/summary",
  protect,
  getFollowUpSummary
);

// ==================================
// GET CLIENT ACTIVITY TIMELINE
// ==================================
router.get(
  "/client/:clientId",
  protect,
  getClientActivities
);
// ==================================
// UPDATE FOLLOW-UP
// ==================================

router.put(
  "/:id",
  protect,
  updateActivity
);


// ==================================
// COMPLETE FOLLOW-UP
// ==================================

router.patch(
  "/:id/complete",
  protect,
  completeActivity
);


// ==================================
// DELETE FOLLOW-UP
// ==================================

router.delete(
  "/:id",
  protect,
  deleteActivity
);


module.exports = router;