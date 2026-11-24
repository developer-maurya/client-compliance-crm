const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "PCB",
        "CGWA",
        "OTHERS",
        "FOLLOW_UP",
      ],
      required: true,
    },

    reminderDays: {
      type: Number,
      enum: [60, 30, 7],
      required: true,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    reminderDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Sent",
        "Completed",
      ],
      default: "Pending",
    },

    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Reminder",
  reminderSchema
);