const Client = require("../models/Client");

// ==================================
// CREATE CLIENT
// ==================================
const createClient = async (req, res) => {
  try {
    const client = await Client.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Client created successfully",
      client,
    });
  } catch (error) {
    console.error("Create client error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create client",
      error: error.message,
    });
  }
};

// ==================================
// GET CLIENTS + SEARCH + FILTER
// ==================================
const getClients = async (req, res) => {
  try {
    const {
      search,
      district,
      state,
      industryType,
      sort,
    } = req.query;

    const filter = {};

    // Search company, email or mobile
    if (search) {
      filter.$or = [
        {
          companyName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          mobileNumber: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // District filter
    if (district) {
      filter.district = {
        $regex: district,
        $options: "i",
      };
    }

    // State filter
    if (state) {
      filter.state = {
        $regex: state,
        $options: "i",
      };
    }

    // Industry filter
    if (industryType) {
      filter.industryType = {
        $regex: industryType,
        $options: "i",
      };
    }

    // Sorting
    let sortOption = {
      createdAt: -1,
    };

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    }

    const clients = await Client.find(filter).sort(sortOption);

    res.status(200).json({
      success: true,
      count: clients.length,
      clients,
    });
  } catch (error) {
    console.error("Get clients error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get clients",
      error: error.message,
    });
  }
};

// ==================================
// GET EXPIRING / EXPIRED CLIENTS
// ==================================
const getExpiryClients = async (req, res) => {
  try {
    const today = new Date();

    const clients = await Client.find();

    const result = clients.map((client) => {
      const pcbDate = client.pcbNocValidity
        ? new Date(client.pcbNocValidity)
        : null;

      const cgwaDate = client.cgwaNocValidity
        ? new Date(client.cgwaNocValidity)
        : null;

      const othersDate = client.othersValidity
        ? new Date(client.othersValidity)
        : null;

      const getStatus = (date) => {
        if (!date) {
          return "Not Available";
        }

        const difference =
          date.getTime() - today.getTime();

        const daysLeft = Math.ceil(
          difference / (1000 * 60 * 60 * 24)
        );

        if (daysLeft < 0) {
          return "Expired";
        }

        if (daysLeft <= 7) {
          return "Expiring in 7 days";
        }

        if (daysLeft <= 30) {
          return "Expiring in 30 days";
        }

        if (daysLeft <= 60) {
          return "Expiring in 60 days";
        }

        return "Valid";
      };

      return {
        ...client.toObject(),

        expiryStatus: {
          pcb: getStatus(pcbDate),
          cgwa: getStatus(cgwaDate),
          others: getStatus(othersDate),
        },
      };
    });

    res.status(200).json({
      success: true,
      count: result.length,
      clients: result,
    });
  } catch (error) {
    console.error("Expiry clients error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get expiry clients",
      error: error.message,
    });
  }
};

// ==================================
// DASHBOARD SUMMARY
// ==================================
const getDashboardSummary = async (req, res) => {
  try {
    const clients = await Client.find();

    const today = new Date();

    const totalClients = clients.length;

    let expired = 0;
    let within7Days = 0;
    let within30Days = 0;
    let within60Days = 0;

    clients.forEach((client) => {
      const dates = [
        client.pcbNocValidity,
        client.cgwaNocValidity,
        client.othersValidity,
      ];

      dates.forEach((dateValue) => {
        if (!dateValue) {
          return;
        }

        const expiryDate = new Date(dateValue);

        const difference =
          expiryDate.getTime() - today.getTime();

        const daysLeft = Math.ceil(
          difference / (1000 * 60 * 60 * 24)
        );

        if (daysLeft < 0) {
          expired++;
        } else if (daysLeft <= 7) {
          within7Days++;
        } else if (daysLeft <= 30) {
          within30Days++;
        } else if (daysLeft <= 60) {
          within60Days++;
        }
      });
    });

    res.status(200).json({
      success: true,
      dashboard: {
        totalClients,
        expired,
        within7Days,
        within30Days,
        within60Days,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get dashboard summary",
      error: error.message,
    });
  }
};

// ==================================
// CONVERSION FUNNEL
// Lead → Quote → Deal → Lost
// ==================================
const getConversionFunnel = async (req, res) => {
  try {
    const leads = await Client.countDocuments({
      status: "Lead",
    });

    const quotes = await Client.countDocuments({
      status: "Quote",
    });

    const deals = await Client.countDocuments({
      status: "Deal",
    });

    const lost = await Client.countDocuments({
      status: "Lost",
    });

    res.status(200).json({
      success: true,
      funnel: {
        leads,
        quotes,
        deals,
        lost,
      },
    });
  } catch (error) {
    console.error("Conversion funnel error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get conversion funnel",
      error: error.message,
    });
  }
};
// ==================================
// UPDATE CLIENT STATUS
// Lead → Quote → Deal → Lost
// ==================================
const updateClientStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Lead",
      "Quote",
      "Deal",
      "Lost",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        allowedStatuses,
      });
    }

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Client status updated successfully",
      client,
    });
  } catch (error) {
    console.error("Update status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update client status",
      error: error.message,
    });
  }
};

// ==================================
// GET SINGLE CLIENT
// ==================================
const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      success: true,
      client,
    });
  } catch (error) {
    console.error("Get single client error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get client",
      error: error.message,
    });
  }
};

// ==================================
// UPDATE CLIENT
// ==================================
const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Client updated successfully",
      client,
    });
  } catch (error) {
    console.error("Update client error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update client",
      error: error.message,
    });
  }
};

// ==================================
// DELETE CLIENT
// ==================================
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(
      req.params.id
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Delete client error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete client",
      error: error.message,
    });
  }
};

// ==================================
// EXPORT ALL FUNCTIONS
// ==================================
module.exports = {
  createClient,
  getClients,
  getExpiryClients,
  getDashboardSummary,
  getConversionFunnel,
  updateClientStatus,
  getClientById,
  updateClient,
  deleteClient,
};