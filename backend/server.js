const express = require("express");
const cors = require("cors");
require("dotenv").config();

// ==================================
// DATABASE
// ==================================
const connectDB = require("./config/db");

// ==================================
// ROUTES
// ==================================
const authRoutes = require("./routes/authRoutes");
const clientRoutes = require("./routes/clientRoutes");
const activityRoutes = require("./routes/activityRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");

// ==================================
// REMINDER JOB
// ==================================
const { startReminderJob } = require("./jobs/reminderJob");

// ==================================
// APP
// ==================================
const app = express();

// ==================================
// CONNECT MONGODB
// ==================================
connectDB();

// ==================================
// MIDDLEWARE
// ==================================
app.use(cors());
app.use(express.json());

// ==================================
// API ROUTES
// ==================================

// Auth
app.use("/api/auth", authRoutes);

// Clients
app.use("/api/clients", clientRoutes);

// Activities / Follow-ups
app.use("/api/activities", activityRoutes);

// Reminders
app.use("/api/reminders", reminderRoutes);

// Reports
app.use("/api/reports", reportRoutes);

// Users
app.use("/api/users", userRoutes);

// ==================================
// TEST ROUTE
// ==================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Client Compliance CRM API is running",
  });
});

// ==================================
// SERVER
// ==================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Start automatic reminder system
  startReminderJob();
});