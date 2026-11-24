

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

const Reports = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    totalClients: 0,
    totalExpired: 0,
    totalUpcoming: 0,
    pcbExpired: 0,
    pcbUpcoming: 0,
    cgwaExpired: 0,
    cgwaUpcoming: 0,
    othersExpired: 0,
    othersUpcoming: 0,
  });

  const [upcomingExpiries, setUpcomingExpiries] = useState([]);
  const [expiredDocuments, setExpiredDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("upcoming");

  // ==================================
  // FETCH REPORT
  // ==================================
  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/reports/compliance"
      );

      setSummary(
        response.data.summary || {}
      );

      setUpcomingExpiries(
        response.data.upcomingExpiries || []
      );

      setExpiredDocuments(
        response.data.expiredDocuments || []
      );
    } catch (error) {
      console.error(
        "Report fetch error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load compliance report"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // ==================================
  // FORMAT DATE
  // ==================================
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  // ==================================
  // DOCUMENT TYPE
  // ==================================
  const getDocumentType = (type) => {
    switch (type) {
      case "PCB":
        return "PCB NOC";

      case "CGWA":
        return "CGWA NOC";

      case "OTHERS":
        return "Other Document";

      default:
        return type || "-";
    }
  };

  // ==================================
  // VIEW CLIENT
  // ==================================
  const handleViewClient = (clientId) => {
    if (!clientId) return;

    navigate(`/clients/${clientId}`);
  };

  // ==================================
  // LOADING
  // ==================================
  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-message">
          Loading reports...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container reports-page">

      {/* ==================================
          HEADER
      ================================== */}
      <div className="detail-header">
        <div>
          <h1>Reports</h1>

          <p>
            Client compliance and document
            expiry reports
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchReport}
        >
          Refresh
        </button>
      </div>

      {/* ==================================
          ERROR
      ================================== */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ==================================
          SUMMARY CARDS
      ================================== */}
      <div className="reports-stats-grid">

        <div className="report-stat-card">
          <span>Total Clients</span>

          <strong>
            {summary.totalClients || 0}
          </strong>

          <small>
            All registered clients
          </small>
        </div>

        <div className="report-stat-card upcoming-card">
          <span>Upcoming Expiry</span>

          <strong>
            {summary.totalUpcoming || 0}
          </strong>

          <small>
            Within next 60 days
          </small>
        </div>

        <div className="report-stat-card expired-card">
          <span>Expired Documents</span>

          <strong>
            {summary.totalExpired || 0}
          </strong>

          <small>
            Documents already expired
          </small>
        </div>

        <div className="report-stat-card">
          <span>PCB NOC</span>

          <strong>
            {(summary.pcbUpcoming || 0) +
              (summary.pcbExpired || 0)}
          </strong>

          <small>
            Upcoming: {summary.pcbUpcoming || 0}
            {" | "}
            Expired: {summary.pcbExpired || 0}
          </small>
        </div>

        <div className="report-stat-card">
          <span>CGWA NOC</span>

          <strong>
            {(summary.cgwaUpcoming || 0) +
              (summary.cgwaExpired || 0)}
          </strong>

          <small>
            Upcoming: {summary.cgwaUpcoming || 0}
            {" | "}
            Expired: {summary.cgwaExpired || 0}
          </small>
        </div>

        <div className="report-stat-card">
          <span>Other Documents</span>

          <strong>
            {(summary.othersUpcoming || 0) +
              (summary.othersExpired || 0)}
          </strong>

          <small>
            Upcoming: {summary.othersUpcoming || 0}
            {" | "}
            Expired: {summary.othersExpired || 0}
          </small>
        </div>

      </div>

      {/* ==================================
          DOCUMENT SUMMARY
      ================================== */}
      <div className="detail-card document-summary-card">

        <div className="section-title">
          <h2>Compliance Summary</h2>
        </div>

        <div className="compliance-summary-grid">

          <div className="compliance-box">
            <div>
              <span>PCB NOC</span>
              <strong>
                {summary.pcbUpcoming || 0}
              </strong>
            </div>

            <p>Upcoming</p>
          </div>

          <div className="compliance-box">
            <div>
              <span>PCB NOC</span>
              <strong className="danger-number">
                {summary.pcbExpired || 0}
              </strong>
            </div>

            <p>Expired</p>
          </div>

          <div className="compliance-box">
            <div>
              <span>CGWA NOC</span>
              <strong>
                {summary.cgwaUpcoming || 0}
              </strong>
            </div>

            <p>Upcoming</p>
          </div>

          <div className="compliance-box">
            <div>
              <span>CGWA NOC</span>
              <strong className="danger-number">
                {summary.cgwaExpired || 0}
              </strong>
            </div>

            <p>Expired</p>
          </div>

          <div className="compliance-box">
            <div>
              <span>Other</span>
              <strong>
                {summary.othersUpcoming || 0}
              </strong>
            </div>

            <p>Upcoming</p>
          </div>

          <div className="compliance-box">
            <div>
              <span>Other</span>
              <strong className="danger-number">
                {summary.othersExpired || 0}
              </strong>
            </div>

            <p>Expired</p>
          </div>

        </div>
      </div>

      {/* ==================================
          REPORT TABS
      ================================== */}
      <div className="detail-card report-table-card">

        <div className="report-tabs">

          <button
            className={
              activeTab === "upcoming"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("upcoming")
            }
          >
            Upcoming Expiries
            <span>
              {upcomingExpiries.length}
            </span>
          </button>

          <button
            className={
              activeTab === "expired"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("expired")
            }
          >
            Expired Documents
            <span>
              {expiredDocuments.length}
            </span>
          </button>

        </div>

        {/* ==================================
            UPCOMING TABLE
        ================================== */}
        {activeTab === "upcoming" && (
          <div className="report-table-wrapper">

            {upcomingExpiries.length === 0 ? (
              <div className="report-empty">
                <h3>
                  No upcoming expiries
                </h3>

                <p>
                  No documents are expiring
                  within the next 60 days.
                </p>
              </div>
            ) : (
              <table className="report-table">

                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Document</th>
                    <th>Expiry Date</th>
                    <th>Days Remaining</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {upcomingExpiries.map(
                    (item, index) => {

                      const today =
                        new Date();

                      const expiry =
                        new Date(
                          item.expiryDate
                        );

                      const daysRemaining =
                        Math.ceil(
                          (expiry - today) /
                            (1000 *
                              60 *
                              60 *
                              24)
                        );

                      return (
                        <tr
                          key={
                            item.clientId +
                            item.type +
                            index
                          }
                        >
                          <td>
                            <strong>
                              {item.companyName ||
                                "Unknown Client"}
                            </strong>
                          </td>

                          <td>
                            <span className="document-badge">
                              {getDocumentType(
                                item.type
                              )}
                            </span>
                          </td>

                          <td>
                            {formatDate(
                              item.expiryDate
                            )}
                          </td>

                          <td>
                            <span
                              className={
                                daysRemaining <= 7
                                  ? "days-danger"
                                  : daysRemaining <=
                                    30
                                  ? "days-warning"
                                  : "days-normal"
                              }
                            >
                              {daysRemaining} days
                            </span>
                          </td>

                          <td>
                            <button
                              className="view-client-btn"
                              onClick={() =>
                                handleViewClient(
                                  item.clientId
                                )
                              }
                            >
                              View Client
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>

              </table>
            )}

          </div>
        )}

        {/* ==================================
            EXPIRED TABLE
        ================================== */}
        {activeTab === "expired" && (
          <div className="report-table-wrapper">

            {expiredDocuments.length === 0 ? (
              <div className="report-empty">
                <h3>
                  No expired documents
                </h3>

                <p>
                  All available compliance
                  documents are currently valid.
                </p>
              </div>
            ) : (
              <table className="report-table">

                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Document</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {expiredDocuments.map(
                    (item, index) => {

                      return (
                        <tr
                          key={
                            item.clientId +
                            item.type +
                            index
                          }
                        >
                          <td>
                            <strong>
                              {item.companyName ||
                                "Unknown Client"}
                            </strong>
                          </td>

                          <td>
                            <span className="document-badge">
                              {getDocumentType(
                                item.type
                              )}
                            </span>
                          </td>

                          <td>
                            {formatDate(
                              item.expiryDate
                            )}
                          </td>

                          <td>
                            <span className="expired-badge">
                              Expired
                            </span>
                          </td>

                          <td>
                            <button
                              className="view-client-btn"
                              onClick={() =>
                                handleViewClient(
                                  item.clientId
                                )
                              }
                            >
                              View Client
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>

              </table>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;