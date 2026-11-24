const express = require("express");

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const {
  protect,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================
// LOGIN
// ==========================
router.post("/login", loginUser);

// ==========================
// REGISTER
// Only Founder and SEO
// ==========================
router.post(
  "/register",
  protect,
  allowRoles("founder", "seo"),
  registerUser
);

// ==========================
// PROFILE
// Any logged-in user
// ==========================
router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    message: "Protected profile accessed successfully",
    user: req.user,
  });
});

// ==========================
// FULL ACCESS
// Only Founder and SEO
// ==========================
router.get(
  "/full-access",
  protect,
  allowRoles("founder", "seo"),
  (req, res) => {
    res.json({
      success: true,
      message: "Founder/SEO full access granted",
      user: req.user,
    });
  }
);

module.exports = router;