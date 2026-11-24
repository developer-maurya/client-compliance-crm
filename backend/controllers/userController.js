const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ==========================================
// CREATE USER
// Only Founder & SEO
// ==========================================
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

    // Allowed roles
    const allowedRoles = [
      "founder",
      "seo",
      "admin",
      "manager",
      "sales",
      "employee",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Check existing email
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};


// ==========================================
// GET ALL USERS
// ==========================================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get users",
      error: error.message,
    });
  }
};


// ==========================================
// GET SINGLE USER
// ==========================================
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get user",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE USER ROLE
// ==========================================
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const allowedRoles = [
      "founder",
      "seo",
      "admin",
      "manager",
      "sales",
      "employee",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update role error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error.message,
    });
  }
};


// ==========================================
// TOGGLE USER ACTIVE STATUS
// ==========================================
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      req.user &&
      req.user._id &&
      req.user._id.toString() === user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status",
      });
    }

    user.isActive = !user.isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Toggle user status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
};


// ==========================================
// DELETE USER
// ==========================================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      req.user &&
      req.user._id &&
      req.user._id.toString() === user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};


module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
};