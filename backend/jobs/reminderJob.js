const cron = require("node-cron");

const Client = require("../models/Client");
const Reminder = require("../models/Reminder");
const Activity = require("../models/Activity");

const { sendEmail } = require("../config/email");

// ==========================================
// GENERATE AUTOMATIC EXPIRY REMINDERS
// 60 / 30 / 7 DAYS
// ==========================================
const generateAutomaticReminders = async () => {
  try {
    console.log("Checking expiry reminders...");

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

        const expiryDate = new Date(document.expiryDate);

        for (const days of reminderDays) {
          const reminderDate = new Date(expiryDate);

          reminderDate.setDate(
            reminderDate.getDate() - days
          );

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

    console.log(
      `Expiry reminder generation completed. Created: ${createdCount}`
    );

    return createdCount;
  } catch (error) {
    console.error(
      "Automatic reminder error:",
      error.message
    );

    throw error;
  }
};

// ==========================================
// SEND DUE EXPIRY REMINDERS
// ==========================================
const sendDueExpiryReminders = async () => {
  try {
    const now = new Date();

    const reminders = await Reminder.find({
      status: "Pending",
      reminderDate: {
        $lte: now,
      },
    }).populate(
      "client",
      "companyName email mobileNumber"
    );

    console.log(
      `Due expiry reminders found: ${reminders.length}`
    );

    let sentCount = 0;

    for (const reminder of reminders) {
      const client = reminder.client;

      if (!client || !client.email) {
        console.log(
          `Skipping reminder ${reminder._id}: email not available`
        );

        continue;
      }

      const expiryDate = new Date(
        reminder.expiryDate
      ).toLocaleDateString("en-IN");

      await sendEmail({
        to: client.email,

        subject:
          `${reminder.type} NOC Expiry Reminder - ` +
          `${client.companyName}`,

        text: `
Dear ${client.companyName},

This is a reminder that your ${reminder.type} NOC/document is approaching expiry.

Expiry Date: ${expiryDate}

Reminder: ${reminder.reminderDays} days before expiry.

Please take the necessary action.

Regards,
Client Compliance CRM
        `,

        html: `
          <h2>Client Compliance CRM</h2>

          <p>
            Dear <strong>${client.companyName}</strong>,
          </p>

          <p>
            This is a reminder that your
            <strong>${reminder.type}</strong>
            NOC/document is approaching expiry.
          </p>

          <p>
            <strong>Expiry Date:</strong>
            ${expiryDate}
          </p>

          <p>
            <strong>Reminder:</strong>
            ${reminder.reminderDays} days before expiry
          </p>

          <p>
            Please take the necessary action.
          </p>

          <br>

          <p>
            Regards,<br>
            <strong>Client Compliance CRM</strong>
          </p>
        `,
      });

      await Reminder.findByIdAndUpdate(
        reminder._id,
        {
          status: "Sent",
          sentAt: new Date(),
        }
      );

      sentCount++;

      console.log(
        `Email sent: ${client.companyName} - ${reminder.type}`
      );
    }

    return sentCount;
  } catch (error) {
    console.error(
      "Send expiry reminder error:",
      error.message
    );

    throw error;
  }
};

// ==========================================
// SEND FOLLOW-UP REMINDERS
// ==========================================
const sendFollowUpReminders = async () => {
  try {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const activities = await Activity.find({
      nextFollowUpDate: {
        $gte: startOfToday,
        $lte: endOfToday,
      },

      status: {
        $nin: ["Closed", "Converted"],
      },
    })
      .populate(
        "client",
        "companyName email mobileNumber"
      )
      .populate(
        "createdBy",
        "name email role"
      );

    console.log(
      `Today's follow-ups found: ${activities.length}`
    );

    let sentCount = 0;

    for (const activity of activities) {
      const client = activity.client;

      if (!client || !client.email) {
        console.log(
          "Follow-up skipped: client email not available"
        );

        continue;
      }

      const followUpDate = new Date(
        activity.nextFollowUpDate
      ).toLocaleDateString("en-IN");

      await sendEmail({
        to: client.email,

        subject:
          `Follow-up Reminder - ${client.companyName}`,

        text: `
Follow-up reminder for ${client.companyName}.

Follow-up Date: ${followUpDate}

Status: ${activity.status}

Note:
${activity.note}

Regards,
Client Compliance CRM
        `,

        html: `
          <h2>Follow-up Reminder</h2>

          <p>
            <strong>Client:</strong>
            ${client.companyName}
          </p>

          <p>
            <strong>Follow-up Date:</strong>
            ${followUpDate}
          </p>

          <p>
            <strong>Status:</strong>
            ${activity.status}
          </p>

          <p>
            <strong>Note:</strong>
          </p>

          <p>
            ${activity.note}
          </p>

          <br>

          <p>
            Regards,<br>
            <strong>Client Compliance CRM</strong>
          </p>
        `,
      });

      sentCount++;

      console.log(
        `Follow-up email sent to ${client.email}`
      );
    }

    return sentCount;
  } catch (error) {
    console.error(
      "Follow-up reminder error:",
      error.message
    );

    throw error;
  }
};

// ==========================================
// RUN COMPLETE REMINDER SYSTEM
// ==========================================
const runReminderSystem = async () => {
  try {
    console.log(
      "===================================="
    );

    console.log(
      "Running CRM reminder system..."
    );

    console.log(
      "===================================="
    );

    // 1. Generate expiry reminders
    const createdCount =
      await generateAutomaticReminders();

    // 2. Send expiry reminder emails
    const expirySentCount =
      await sendDueExpiryReminders();

    // 3. Send follow-up reminder emails
    const followUpSentCount =
      await sendFollowUpReminders();

    console.log(
      "CRM reminder system completed."
    );

    return {
      createdCount,
      expirySentCount,
      followUpSentCount,
    };
  } catch (error) {
    console.error(
      "Reminder system error:",
      error.message
    );

    throw error;
  }
};

// ==========================================
// CRON JOB
// EVERY DAY AT 12:00 AM IST
// ==========================================
const startReminderJob = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        await runReminderSystem();
      } catch (error) {
        console.error(
          "Cron reminder error:",
          error.message
        );
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log(
    "Reminder cron job started - 12:00 AM IST"
  );
};

// ==========================================
// EXPORT
// ==========================================
module.exports = {
  startReminderJob,
  generateAutomaticReminders,
  sendDueExpiryReminders,
  sendFollowUpReminders,
  runReminderSystem,
};