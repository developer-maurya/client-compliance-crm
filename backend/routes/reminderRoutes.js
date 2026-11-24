const express = require("express");

const {
  generateReminders,
  getTodayReminders,
  getPendingReminders,
  markReminderSent,
} = require("../controllers/reminderController");

const {
  protect,
  allowRoles,
} = require("../middleware/authMiddleware");

const { sendEmail } = require("../config/email");

const {
  runReminderSystem,
} = require("../jobs/reminderJob");

const router = express.Router();

// ==================================
// GENERATE REMINDERS
// Founder, SEO, Admin
// ==================================
router.post(
  "/generate",
  protect,
  allowRoles("founder", "seo", "admin"),
  generateReminders
);

// ==================================
// TODAY'S REMINDERS
// Any logged-in user
// ==================================
router.get(
  "/today",
  protect,
  getTodayReminders
);

// ==================================
// ALL PENDING REMINDERS
// Any logged-in user
// ==================================
router.get(
  "/pending",
  protect,
  getPendingReminders
);

// ==================================
// TEST EMAIL
// Founder, SEO, Admin
// ==================================
router.post(
  "/test-email",
  protect,
  allowRoles("founder", "seo", "admin"),
  async (req, res) => {
    try {
      await sendEmail({
        to: process.env.EMAIL_USER,

        subject: "CRM Email Test",

        text:
          "Client Compliance CRM email system is working successfully.",

        html: `
          <h2>Client Compliance CRM</h2>

          <p>
            Email system is working successfully.
          </p>

          <p>
            This is a test email.
          </p>
        `,
      });

      res.status(200).json({
        success: true,
        message: "Test email sent successfully",
      });

    } catch (error) {
      console.error(
        "Test email error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Test email failed",
        error: error.message,
      });
    }
  }
);

// ==================================
// RUN REMINDER SYSTEM MANUALLY
// Founder, SEO, Admin
// ==================================
router.post(
  "/run",
  protect,
  allowRoles("founder", "seo", "admin"),
  async (req, res) => {
    try {
      await runReminderSystem();

      res.status(200).json({
        success: true,
        message:
          "Reminder system executed successfully",
      });

    } catch (error) {
      console.error(
        "Manual reminder error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to run reminder system",
        error: error.message,
      });
    }
  }
);

// ==================================
// MARK REMINDER AS SENT
// Founder, SEO, Admin
// ==================================
router.patch(
  "/:id/sent",
  protect,
  allowRoles("founder", "seo", "admin"),
  markReminderSent
);

// ==================================
// EXPORT ROUTER ONLY
// ==================================
module.exports = router;