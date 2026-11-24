const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    // Client
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    // Activity kis user ne create ki
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Follow-up note
    note: {
      type: String,
      required: true,
      trim: true,
    },

    // Follow-up status
    status: {
      type: String,
      enum: [
        "Pending",
        "Interested",
        "Follow-up",
        "Converted",
        "Not Interested",
        "Closed",
      ],
      default: "Pending",
    },

    // Next follow-up
    nextFollowUpDate: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Activity", activitySchema);