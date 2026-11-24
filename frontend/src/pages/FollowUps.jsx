import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const FollowUps = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    todayFollowUps: 0,
    overdueFollowUps: 0,
    upcomingFollowUps: 0,
    pendingFollowUps: 0,
    interestedClients: 0,
    convertedClients: 0,
  });

  const [todayFollowUps, setTodayFollowUps] = useState([]);
  const [overdueFollowUps, setOverdueFollowUps] = useState([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // GET FOLLOW-UP SUMMARY
  // ==========================================

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/activities/summary");

      setSummary(
        response.data.summary || {
          todayFollowUps: 0,
          overdueFollowUps: 0,
          upcomingFollowUps: 0,
          pendingFollowUps: 0,
          interestedClients: 0,
          convertedClients: 0,
        }
      );

      setTodayFollowUps(
        response.data.todayFollowUps || []
      );

      setOverdueFollowUps(
        response.data.overdueFollowUps || []
      );

      setUpcomingFollowUps(
        response.data.upcomingFollowUps || []
      );
    } catch (error) {
      console.error(
        "Follow-up summary error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load follow-ups"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  // ==========================================
  // DATE FORMAT
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
  // CLIENT DETAILS
  // ==========================================

  const openClient = (clientId) => {
    if (clientId) {
      navigate(`/clients/${clientId}`);
    }
  };

  // ==========================================
  // EDIT FOLLOW-UP
  // ==========================================

  const handleEdit = (activity) => {
    navigate(
      `/clients/${activity.client?._id}/activities`,
      {
        state: {
          editActivity: activity,
        },
      }
    );
  };

  // ==========================================
  // COMPLETE FOLLOW-UP
  // ==========================================

  const handleComplete = async (activityId) => {
    const confirmComplete = window.confirm(
      "Are you sure you want to mark this follow-up as completed?"
    );

    if (!confirmComplete) return;

    try {
      await api.patch(
  `/activities/${activityId}/complete`
);

      alert("Follow-up completed successfully");

      fetchFollowUps();
    } catch (error) {
      console.error(
        "Complete follow-up error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to complete follow-up"
      );
    }
  };

  // ==========================================
  // DELETE FOLLOW-UP
  // ==========================================

  const handleDelete = async (activityId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this follow-up?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(
        `/activities/${activityId}`
      );

      alert("Follow-up deleted successfully");

      fetchFollowUps();
    } catch (error) {
      console.error(
        "Delete follow-up error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete follow-up"
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-message">
          Loading follow-ups...
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          {error}
        </div>

        <button
          className="view-btn"
          onClick={fetchFollowUps}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="detail-header">
        <div>
          <h1>Follow Ups</h1>

          <p>
            Manage client follow-ups and activities
          </p>
        </div>

        <button
          className="view-btn"
          onClick={fetchFollowUps}
        >
          Refresh
        </button>
      </div>

      {/* ==========================================
          SUMMARY CARDS
      ========================================== */}

      <div className="stats-grid">

        <div className="stat-card">
          <span>Today's Follow-ups</span>
          <strong>
            {summary.todayFollowUps}
          </strong>
        </div>

        <div className="stat-card">
          <span>Overdue</span>
          <strong>
            {summary.overdueFollowUps}
          </strong>
        </div>

        <div className="stat-card">
          <span>Upcoming</span>
          <strong>
            {summary.upcomingFollowUps}
          </strong>
        </div>

        <div className="stat-card">
          <span>Pending</span>
          <strong>
            {summary.pendingFollowUps}
          </strong>
        </div>

        <div className="stat-card">
          <span>Interested</span>
          <strong>
            {summary.interestedClients}
          </strong>
        </div>

        <div className="stat-card">
          <span>Converted</span>
          <strong>
            {summary.convertedClients}
          </strong>
        </div>

      </div>

      {/* ==========================================
          TODAY FOLLOW-UPS
      ========================================== */}

      <FollowUpSection
        title="Today's Follow-ups"
        data={todayFollowUps}
        emptyText="No follow-ups for today."
        formatDate={formatDate}
        onClientClick={openClient}
        onEdit={handleEdit}
        onComplete={handleComplete}
        onDelete={handleDelete}
      />

      {/* ==========================================
          OVERDUE
      ========================================== */}

      <FollowUpSection
        title="Overdue Follow-ups"
        data={overdueFollowUps}
        emptyText="No overdue follow-ups."
        formatDate={formatDate}
        onClientClick={openClient}
        onEdit={handleEdit}
        onComplete={handleComplete}
        onDelete={handleDelete}
      />

      {/* ==========================================
          UPCOMING
      ========================================== */}

      <FollowUpSection
        title="Upcoming Follow-ups"
        data={upcomingFollowUps}
        emptyText="No upcoming follow-ups."
        formatDate={formatDate}
        onClientClick={openClient}
        onEdit={handleEdit}
        onComplete={handleComplete}
        onDelete={handleDelete}
      />

    </div>
  );
};


// ==========================================
// FOLLOW-UP SECTION
// ==========================================

const FollowUpSection = ({
  title,
  data,
  emptyText,
  formatDate,
  onClientClick,
  onEdit,
  onComplete,
  onDelete,
}) => {
  return (
    <div className="detail-card followup-section">

      {/* SECTION HEADER */}

      <div className="section-title">
        <h2>{title}</h2>

        <span className="section-count">
          {data.length}
        </span>
      </div>

      {/* EMPTY */}

      {data.length === 0 ? (
        <p className="empty-message">
          {emptyText}
        </p>
      ) : (

        <div className="followup-list">

          {data.map((activity) => {

            const client = activity.client;

            return (
              <div
                className="followup-item"
                key={activity._id}
              >

                {/* ==================================
                    FOLLOW-UP INFORMATION
                ================================== */}

                <div className="followup-info">

                  <h3>
                    {client?.companyName ||
                      "Unknown Client"}
                  </h3>

                  <p>
                    {activity.note}
                  </p>

                  <div className="followup-meta">

                    <span>
                      Status:{" "}
                      <strong>
                        {activity.status}
                      </strong>
                    </span>

                    <span>
                      Follow-up:{" "}
                      <strong>
                        {formatDate(
                          activity.nextFollowUpDate
                        )}
                      </strong>
                    </span>

                    {activity.createdBy && (
                      <span>
                        By:{" "}
                        {activity.createdBy.name ||
                          activity.createdBy.email}
                      </span>
                    )}

                  </div>

                </div>


                {/* ==================================
                    ACTION BUTTONS
                ================================== */}

                <div className="followup-actions">

                  {/* EDIT */}

                  <button
                    className="edit-btn"
                    onClick={() =>
                      onEdit(activity)
                    }
                  >
                    Edit
                  </button>


                  {/* COMPLETE */}

                  {activity.status !==
                    "Converted" &&
                    activity.status !==
                      "Closed" && (

                      <button
                        className="complete-btn"
                        onClick={() =>
                          onComplete(
                            activity._id
                          )
                        }
                      >
                        Complete
                      </button>

                    )}


                  {/* DELETE */}

                  <button
                    className="delete-btn"
                    onClick={() =>
                      onDelete(activity._id)
                    }
                  >
                    Delete
                  </button>


                  {/* VIEW CLIENT */}

                  <button
                    className="view-btn"
                    onClick={() =>
                      onClientClick(
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

export default FollowUps;