const express = require("express");

const {
  createClient,
  getClients,
  getExpiryClients,
  getDashboardSummary,
  getConversionFunnel,
  updateClientStatus,
  getClientById,
  updateClient,
  deleteClient,
} = require("../controllers/clientController");

const {
  protect,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==================================
// ADD CLIENT
// Founder, SEO, Admin, Sales
// ==================================
router.post(
  "/",
  protect,
  allowRoles("founder", "seo", "admin", "sales"),
  createClient
);

// ==================================
// UPDATE CLIENT STATUS
// Founder, SEO, Admin, Sales
// ==================================
router.patch(
  "/:id/status",
  protect,
  allowRoles("founder", "seo", "admin", "sales"),
  updateClientStatus
);

// ==================================
// GET ALL CLIENTS
// Any logged-in user
// ==================================
router.get(
  "/",
  protect,
  getClients
);

// ==================================
// GET EXPIRY CLIENTS
// Any logged-in user
// ==================================
router.get(
  "/expiry",
  protect,
  getExpiryClients
);

// ==================================
// DASHBOARD SUMMARY
// Any logged-in user
// ==================================
router.get(
  "/dashboard/summary",
  protect,
  getDashboardSummary
);

// ==================================
// CONVERSION FUNNEL
// Lead → Quote → Deal → Lost
// Any logged-in user
// ==================================
router.get(
  "/dashboard/funnel",
  protect,
  getConversionFunnel
);

// ==================================
// GET SINGLE CLIENT
// Any logged-in user
// ==================================
router.get(
  "/:id",
  protect,
  getClientById
);

// ==================================
// UPDATE CLIENT
// Founder, SEO, Admin, Sales
// ==================================
router.put(
  "/:id",
  protect,
  allowRoles("founder", "seo", "admin", "sales"),
  updateClient
);

// ==================================
// DELETE CLIENT
// Founder, SEO, Admin only
// ==================================
router.delete(
  "/:id",
  protect,
  allowRoles("founder", "seo", "admin"),
  deleteClient
);

module.exports = router;