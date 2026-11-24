const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    mobileNumber: {
      type: String,
      trim: true,
    },

    district: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    dataSource: {
      type: String,
      trim: true,
    },

    industryType: {
      type: String,
      trim: true,
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    msmeType: {
      type: String,
      trim: true,
    },

    investmentCost: {
      type: Number,
    },

    pcbNocValidity: {
      type: Date,
    },

    cgwaNocValidity: {
      type: Date,
    },

    othersValidity: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
    },

    // ==================================
    // CLIENT STATUS
    // ==================================
    status: {
      type: String,
      enum: ["Lead", "Quote", "Deal", "Lost"],
      default: "Lead",
    },

    // Who created this client
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Client", clientSchema);