const Client = require("../models/Client");

const getComplianceReport = async (req, res) => {
  try {
    const clients = await Client.find().sort({
      companyName: 1,
    });

    const today = new Date();
    
    const next60Days = new Date();
    next60Days.setDate(next60Days.getDate() + 60);

    let totalClients = clients.length;

    let pcbExpired = 0;
    let pcbUpcoming = 0;

    let cgwaExpired = 0;
    let cgwaUpcoming = 0;

    let othersExpired = 0;
    let othersUpcoming = 0;

    const upcomingExpiries = [];
    const expiredDocuments = [];

    clients.forEach((client) => {
      const documents = [
        {
          type: "PCB",
          label: "PCB NOC",
          expiryDate: client.pcbNocValidity,
        },
        {
          type: "CGWA",
          label: "CGWA NOC",
          expiryDate: client.cgwaNocValidity,
        },
        {
          type: "OTHERS",
          label: "Other Document",
          expiryDate: client.othersValidity,
        },
      ];

      documents.forEach((document) => {
        if (!document.expiryDate) return;

        const expiryDate = new Date(document.expiryDate);

        // Expired
        if (expiryDate < today) {
          expiredDocuments.push({
            clientId: client._id,
            companyName: client.companyName,
            type: document.type,
            document: document.label,
            expiryDate,
          });

          if (document.type === "PCB") {
            pcbExpired++;
          }

          if (document.type === "CGWA") {
            cgwaExpired++;
          }

          if (document.type === "OTHERS") {
            othersExpired++;
          }
        }

        // Upcoming within 60 days
        if (
          expiryDate >= today &&
          expiryDate <= next60Days
        ) {
          upcomingExpiries.push({
            clientId: client._id,
            companyName: client.companyName,
            type: document.type,
            document: document.label,
            expiryDate,
          });

          if (document.type === "PCB") {
            pcbUpcoming++;
          }

          if (document.type === "CGWA") {
            cgwaUpcoming++;
          }

          if (document.type === "OTHERS") {
            othersUpcoming++;
          }
        }
      });
    });

    res.status(200).json({
      success: true,

      summary: {
        totalClients,

        totalExpired:
          expiredDocuments.length,

        totalUpcoming:
          upcomingExpiries.length,

        pcbExpired,
        pcbUpcoming,

        cgwaExpired,
        cgwaUpcoming,

        othersExpired,
        othersUpcoming,
      },

      upcomingExpiries,

      expiredDocuments,
    });
  } catch (error) {
    console.error(
      "Compliance report error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to generate compliance report",
      error: error.message,
    });
  }
};

module.exports = {
  getComplianceReport,
};