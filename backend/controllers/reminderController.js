const Reminder = require("../models/Reminder");
const Client = require("../models/Client");

// ==================================
// GENERATE REMINDERS
// 60 / 30 / 7 DAYS
// ==================================
const generateReminders = async (req, res) => {
  try {
    const clients = await Client.find();

    const reminderDays = [60, 30, 7];

    let createdCount = 0;

    for (const client of clients) {
      const documents = [
        {
          type: "PCB",
          expiryDate: client.pcbNocValidity,
        },
        {
          type: "CGWA",
          expiryDate: client.cgwaNocValidity,
        },
        {
          type: "OTHERS",
          expiryDate: client.othersValidity,
        },
      ];

      for (const document of documents) {
        if (!document.expiryDate) {
          continue;
        }

        const expiryDate = new Date(
          document.expiryDate
        );

        for (const days of reminderDays) {
          const reminderDate = new Date(
            expiryDate
          );

          reminderDate.setDate(
            reminderDate.getDate() - days
          );

          // Check duplicate reminder
          const existingReminder =
            await Reminder.findOne({
              client: client._id,
              type: document.type,
              reminderDays: days,
              expiryDate: expiryDate,
            });

          if (!existingReminder) {
            await Reminder.create({
              client: client._id,
              type: document.type,
              reminderDays: days,
              expiryDate,
              reminderDate,
              status: "Pending",
            });

            createdCount++;
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "Reminders generated successfully",
      createdCount,
    });

  } catch (error) {
    console.error(
      "Generate reminders error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to generate reminders",
      error: error.message,
    });
  }
};


// ==================================
// GET TODAY'S REMINDERS
// ==================================
const getTodayReminders = async (req, res) => {
  try {
    const today = new Date();

    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const reminders = await Reminder.find({
      reminderDate: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
      status: "Pending",
    })
      .populate(
        "client",
        "companyName email mobileNumber"
      )
      .sort({
        reminderDate: 1,
      });

    res.status(200).json({
      success: true,
      count: reminders.length,
      reminders,
    });

  } catch (error) {
    console.error(
      "Today's reminders error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get today's reminders",
      error: error.message,
    });
  }
};


// ==================================
// GET ALL PENDING REMINDERS
// ==================================
const getPendingReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({
      status: "Pending",
    })
      .populate(
        "client",
        "companyName email mobileNumber"
      )
      .sort({
        reminderDate: 1,
      });

    res.status(200).json({
      success: true,
      count: reminders.length,
      reminders,
    });

  } catch (error) {
    console.error(
      "Pending reminders error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get pending reminders",
      error: error.message,
    });
  }
};


// ==================================
// MARK REMINDER AS SENT
// ==================================
const markReminderSent = async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      {
        status: "Sent",
        sentAt: new Date(),
      },
      {
        new: true,
      }
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reminder marked as sent",
      reminder,
    });

  } catch (error) {
    console.error(
      "Mark reminder sent error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update reminder",
      error: error.message,
    });
  }
};
// ==================================
// RUN REMINDER SYSTEM MANUALLY
// Founder, SEO, Admin
// ==================================
const runReminderManually = async (req, res) => {
  try {
    await runReminderSystem();

    res.status(200).json({
      success: true,
      message: "Reminder system executed successfully",
    });
  } catch (error) {
    console.error("Manual reminder error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to run reminder system",
      error: error.message,
    });
  }
};


// ==================================
// EXPORT
// ==================================
module.exports = {
  generateReminders,
  getTodayReminders,
  getPendingReminders,
  markReminderSent,
  runReminderManually,
};