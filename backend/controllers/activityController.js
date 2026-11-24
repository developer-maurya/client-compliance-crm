const Activity = require("../models/Activity");
const Client = require("../models/Client");

// ==================================
// CREATE ACTIVITY / FOLLOW-UP
// ==================================
const createActivity = async (req, res) => {
  try {
    const {
      client,
      note,
      status,
      nextFollowUpDate,
    } = req.body;

    // CHECK CLIENT
    const existingClient = await Client.findById(client);

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // CREATE ACTIVITY
    const activity = await Activity.create({
      client,
      note,
      status,
      nextFollowUpDate,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Follow-up activity created successfully",
      activity,
    });
  } catch (error) {
    console.error("Create activity error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create activity",
      error: error.message,
    });
  }
};


// ==================================
// GET CLIENT ACTIVITIES
// ==================================
const getClientActivities = async (req, res) => {
  try {
    const activities = await Activity.find({
      client: req.params.clientId,
    })
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error("Get activities error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get activities",
      error: error.message,
    });
  }
};


// ==================================
// UPDATE ACTIVITY / FOLLOW-UP
// ==================================
const updateActivity = async (req, res) => {
  try {
    const { note, status, nextFollowUpDate } = req.body;

    const activity = await Activity.findById(
      req.params.id
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    // Update fields only if provided
    if (note !== undefined) {
      activity.note = note;
    }

    if (status !== undefined) {
      activity.status = status;
    }

    if (nextFollowUpDate !== undefined) {
      activity.nextFollowUpDate =
        nextFollowUpDate || null;
    }

    await activity.save();

    const updatedActivity =
      await Activity.findById(activity._id)
        .populate("createdBy", "name email role")
        .populate(
          "client",
          "companyName email mobileNumber"
        );

    res.status(200).json({
      success: true,
      message: "Follow-up updated successfully",
      activity: updatedActivity,
    });
  } catch (error) {
    console.error("Update activity error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update activity",
      error: error.message,
    });
  }
};


// ==================================
// COMPLETE FOLLOW-UP
// ==================================
const completeActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(
      req.params.id
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    activity.status = "Closed";

    await activity.save();

    res.status(200).json({
      success: true,
      message: "Follow-up completed successfully",
      activity,
    });
  } catch (error) {
    console.error(
      "Complete activity error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to complete follow-up",
      error: error.message,
    });
  }
};


// ==================================
// DELETE ACTIVITY
// ==================================
const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(
      req.params.id
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    await Activity.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Follow-up deleted successfully",
    });
  } catch (error) {
    console.error("Delete activity error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete follow-up",
      error: error.message,
    });
  }
};


// ==================================
// FOLLOW-UP DASHBOARD
// ==================================
const getFollowUpSummary = async (req, res) => {
  try {
    const today = new Date();

    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // TODAY
    const todayFollowUps = await Activity.find({
      nextFollowUpDate: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
      status: {
        $nin: ["Converted", "Closed"],
      },
    })
      .populate(
        "client",
        "companyName email mobileNumber"
      )
      .populate(
        "createdBy",
        "name email role"
      )
      .sort({
        nextFollowUpDate: 1,
      });

    // OVERDUE
    const overdueFollowUps = await Activity.find({
      nextFollowUpDate: {
        $lt: startOfToday,
      },
      status: {
        $nin: ["Converted", "Closed"],
      },
    })
      .populate(
        "client",
        "companyName email mobileNumber"
      )
      .populate(
        "createdBy",
        "name email role"
      )
      .sort({
        nextFollowUpDate: 1,
      });

    // UPCOMING
    const upcomingFollowUps = await Activity.find({
      nextFollowUpDate: {
        $gt: endOfToday,
      },
      status: {
        $nin: ["Converted", "Closed"],
      },
    })
      .populate(
        "client",
        "companyName email mobileNumber"
      )
      .populate(
        "createdBy",
        "name email role"
      )
      .sort({
        nextFollowUpDate: 1,
      });

    // COUNTS
    const pendingFollowUps =
      await Activity.countDocuments({
        status: "Pending",
      });

    const interestedClients =
      await Activity.countDocuments({
        status: "Interested",
      });

    const convertedClients =
      await Activity.countDocuments({
        status: "Converted",
      });

    res.status(200).json({
      success: true,

      summary: {
        todayFollowUps:
          todayFollowUps.length,

        overdueFollowUps:
          overdueFollowUps.length,

        upcomingFollowUps:
          upcomingFollowUps.length,

        pendingFollowUps,

        interestedClients,

        convertedClients,
      },

      todayFollowUps,
      overdueFollowUps,
      upcomingFollowUps,
    });
  } catch (error) {
    console.error(
      "Follow-up summary error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get follow-up summary",
      error: error.message,
    });
  }
};


// ==================================
// EXPORT
// ==================================
module.exports = {
  createActivity,
  getClientActivities,
  updateActivity,
  completeActivity,
  deleteActivity,
  getFollowUpSummary,
};