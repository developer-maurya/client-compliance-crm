const express = require("express");

const {
  createUser,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} = require("../controllers/userController");

const {
  protect,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// CREATE USER
// Only Founder and SEO can create login IDs
// ==========================================
router.post(
  "/",
  protect,
  allowRoles("founder", "seo"),
  createUser
);

// ==========================================
// GET ALL USERS
// ==========================================
router.get(
  "/",
  protect,
  allowRoles("founder", "admin"),
  getAllUsers
);

// ==========================================
// GET SINGLE USER
// ==========================================
router.get(
  "/:id",
  protect,
  allowRoles("founder", "admin"),
  getUserById
);

// ==========================================
// UPDATE USER ROLE
// ==========================================
router.patch(
  "/:id/role",
  protect,
  allowRoles("founder", "admin"),
  updateUserRole
);

// ==========================================
// TOGGLE USER STATUS
// ==========================================
router.patch(
  "/:id/status",
  protect,
  allowRoles("founder", "admin"),
  toggleUserStatus
);

// ==========================================
// DELETE USER
// ==========================================
router.delete(
  "/:id",
  protect,
  allowRoles("founder", "admin"),
  deleteUser
);

module.exports = router;