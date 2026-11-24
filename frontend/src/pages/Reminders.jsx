import "../css/Reminders.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

const Reminders = () => {
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [todayReminders, setTodayReminders] = useState([]);
  const [pendingReminders, setPendingReminders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // FETCH TODAY'S REMINDERS
  // ==========================================

  const fetchTodayReminders = async () => {
    try {
      const response = await api.get("/reminders/today");

      setTodayReminders(response.data.reminders || []);
    } catch (error) {
      console.error("Today's reminders error:", error);
      throw error;
    }
  };

  // ==========================================
  // FETCH PENDING REMINDERS
  // ==========================================

  const fetchPendingReminders = async () => {
    try {
      const response = await api.get("/reminders/pending");

      setPendingReminders(response.data.reminders || []);
    } catch (error) {
      console.error("Pending reminders error:", error);
      throw error;
    }
  };

  // ==========================================
  // FETCH ALL REMINDERS
  // ==========================================

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await Promise.all([
        fetchTodayReminders(),
        fetchPendingReminders(),
      ]);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load reminders"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchReminders();
  }, []);

  // ==========================================
  // GENERATE REMINDERS
  // ==========================================

  const handleGenerateReminders = async () => {
    const confirmGenerate = window.confirm(
      "Do you want to generate reminders for all clients?"
    );

    if (!confirmGenerate) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        "/reminders/generate"
      );

      setSuccess(
        response.data.message ||
          "Reminders generated successfully"
      );

      await fetchReminders();
    } catch (error) {
      console.error(
        "Generate reminders error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to generate reminders"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // RUN REMINDER SYSTEM
  // ==========================================

  const handleRunReminderSystem = async () => {
    const confirmRun = window.confirm(
      "Do you want to run the reminder system now?"
    );

    if (!confirmRun) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        "/reminders/run"
      );

      setSuccess(
        response.data.message ||
          "Reminder system executed successfully"
      );

      await fetchReminders();
    } catch (error) {
      console.error(
        "Run reminder system error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to run reminder system"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // MARK REMINDER AS SENT
  // ==========================================

  const handleMarkAsSent = async (reminderId) => {
    console.log(
      "handleMarkAsSent called with ID:",
      reminderId
    );

    const confirmSent = window.confirm(
      "Are you sure you want to mark this reminder as sent?"
    );

    if (!confirmSent) {
      console.log("Mark as Sent cancelled");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      console.log(
        "Sending PATCH request:",
        `/reminders/${reminderId}/sent`
      );

      const response = await api.patch(
        `/reminders/${reminderId}/sent`
      );

      console.log(
        "Mark as Sent response:",
        response.data
      );

      setSuccess(
        response.data.message ||
          "Reminder marked as sent"
      );

      await fetchReminders();
    } catch (error) {
      console.error(
        "Mark reminder sent error:",
        error
      );

      console.error(
        "Response:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          "Failed to mark reminder as sent"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // VIEW CLIENT
  // ==========================================

  const handleViewClient = (clientId) => {
    if (!clientId) return;

    navigate(`/clients/${clientId}`);
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

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

  // ==========================================
  // REMINDER TYPE
  // ==========================================

  const getReminderType = (type) => {
    switch (type) {
      case "PCB":
        return "PCB NOC";

      case "CGWA":
        return "CGWA NOC";

      case "OTHERS":
        return "Other Document";

      case "FOLLOW_UP":
        return "Follow-up";

      default:
        return type || "-";
    }
  };

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    if (!status) return "pending";

    return status
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-message">
          Loading reminders...
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="page-container">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="detail-header">

        <div>
          <h1>Reminders</h1>

          <p>
            Manage client compliance reminders
            and document expiry alerts
          </p>
        </div>

        <div className="reminder-header-actions">

          <button
            className="refresh-btn"
            onClick={fetchReminders}
            disabled={actionLoading}
          >
            Refresh
          </button>

          <button
            className="generate-btn"
            onClick={handleGenerateReminders}
            disabled={actionLoading}
          >
            {actionLoading
              ? "Processing..."
              : "Generate Reminders"}
          </button>

          <button
            className="run-btn"
            onClick={handleRunReminderSystem}
            disabled={actionLoading}
          >
            Run Reminder System
          </button>

        </div>

      </div>

      {/* ==========================================
          SUCCESS MESSAGE
      ========================================== */}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* ==========================================
          ERROR MESSAGE
      ========================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ==========================================
          SUMMARY CARDS
      ========================================== */}

      <div className="stats-grid">

        <div className="stat-card">
          <span>Today's Reminders</span>

          <strong>
            {todayReminders.length}
          </strong>
        </div>

        <div className="stat-card">
          <span>Pending Reminders</span>

          <strong>
            {pendingReminders.length}
          </strong>
        </div>

        <div className="stat-card">
          <span>PCB Reminders</span>

          <strong>
            {
              pendingReminders.filter(
                (item) =>
                  item.type === "PCB"
              ).length
            }
          </strong>
        </div>

        <div className="stat-card">
          <span>CGWA Reminders</span>

          <strong>
            {
              pendingReminders.filter(
                (item) =>
                  item.type === "CGWA"
              ).length
            }
          </strong>
        </div>

        <div className="stat-card">
          <span>Other Reminders</span>

          <strong>
            {
              pendingReminders.filter(
                (item) =>
                  item.type === "OTHERS"
              ).length
            }
          </strong>
        </div>

        <div className="stat-card">
          <span>60 / 30 / 7 Days</span>

          <strong>
            {
              pendingReminders.filter(
                (item) =>
                  [60, 30, 7].includes(
                    item.reminderDays
                  )
              ).length
            }
          </strong>
        </div>

      </div>

      {/* ==========================================
          TODAY'S REMINDERS
      ========================================== */}

      <ReminderSection
        title="Today's Reminders"
        data={todayReminders}
        emptyText="No reminders for today."
        formatDate={formatDate}
        getReminderType={getReminderType}
        getStatusClass={getStatusClass}
        onViewClient={handleViewClient}
        onMarkAsSent={handleMarkAsSent}
        actionLoading={actionLoading}
      />

      {/* ==========================================
          ALL PENDING REMINDERS
      ========================================== */}

      <ReminderSection
        title="All Pending Reminders"
        data={pendingReminders}
        emptyText="No pending reminders."
        formatDate={formatDate}
        getReminderType={getReminderType}
        getStatusClass={getStatusClass}
        onViewClient={handleViewClient}
        onMarkAsSent={handleMarkAsSent}
        actionLoading={actionLoading}
      />

    </div>
  );
};

// ==================================================
// REMINDER SECTION
// ==================================================

const ReminderSection = ({
  title,
  data,
  emptyText,
  formatDate,
  getReminderType,
  getStatusClass,
  onViewClient,
  onMarkAsSent,
  actionLoading,
}) => {
  return (
    <div className="detail-card reminder-section">

      {/* ==========================================
          SECTION HEADER
      ========================================== */}

      <div className="section-title">

        <h2>{title}</h2>

        <span className="section-count">
          {data.length}
        </span>

      </div>

      {/* ==========================================
          EMPTY
      ========================================== */}

      {data.length === 0 ? (

        <p className="empty-message">
          {emptyText}
        </p>

      ) : (

        <div className="reminder-list">

          {data.map((reminder) => {

            const client = reminder.client;

            return (
              <div
                className="reminder-item"
                key={reminder._id}
              >

                {/* ==================================
                    REMINDER INFO
                ================================== */}

                <div className="reminder-info">

                  <div className="reminder-title-row">

                    <h3>
                      {client?.companyName ||
                        "Unknown Client"}
                    </h3>

                    <span
                      className={`reminder-status ${getStatusClass(
                        reminder.status
                      )}`}
                    >
                      {reminder.status}
                    </span>

                  </div>

                  <div className="reminder-details">

                    <span>
                      <strong>
                        Type:
                      </strong>{" "}

                      {getReminderType(
                        reminder.type
                      )}
                    </span>

                    <span>
                      <strong>
                        Reminder:
                      </strong>{" "}

                      {reminder.reminderDays}{" "}
                      days before expiry
                    </span>

                    <span>
                      <strong>
                        Reminder Date:
                      </strong>{" "}

                      {formatDate(
                        reminder.reminderDate
                      )}
                    </span>

                    <span>
                      <strong>
                        Expiry Date:
                      </strong>{" "}

                      {formatDate(
                        reminder.expiryDate
                      )}
                    </span>

                  </div>

                  <div className="reminder-client-info">

                    {client?.email && (
                      <span>
                        Email:{" "}
                        {client.email}
                      </span>
                    )}

                    {client?.mobileNumber && (
                      <span>
                        Mobile:{" "}
                        {client.mobileNumber}
                      </span>
                    )}

                  </div>

                </div>

                {/* ==================================
                    ACTION BUTTONS
                ================================== */}

                <div className="reminder-actions">

                  {/* MARK SENT */}

                  {reminder.status ===
                    "Pending" && (

                    <button
                      className="complete-btn"
                      onClick={() => {
                        console.log(
                          "BUTTON CLICKED"
                        );

                        console.log(
                          "Reminder ID:",
                          reminder._id
                        );

                        onMarkAsSent(
                          reminder._id
                        );
                      }}
                      disabled={actionLoading}
                    >
                      Mark as Sent
                    </button>

                  )}

                  {/* VIEW CLIENT */}

                  <button
                    className="view-btn"
                    onClick={() =>
                      onViewClient(
                        client?._id
                      )
                    }
                  >
                    View Client
                  </button>

                </div>

              </div>
            );
          })}

        </div>

      )}

    </div>
  );
};

export default Reminders;