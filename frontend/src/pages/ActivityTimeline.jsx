import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const ActivityTimeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    note: "",
    status: "Pending",
    nextFollowUpDate: "",
  });

  const [saving, setSaving] = useState(false);

  // ==========================================
  // EDIT MODE
  // ==========================================

  const [editingActivityId, setEditingActivityId] = useState(null);

  // ==========================================
  // GET ACTIVITIES
  // ==========================================

  const fetchActivities = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/activities/client/${id}`
      );

      setActivities(response.data.activities || []);
    } catch (error) {
      console.error("Get activities error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load activities"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [id]);

  // ==========================================
  // EDIT ACTIVITY FROM FOLLOW UPS PAGE
  // ==========================================

  useEffect(() => {
    const editActivity = location.state?.editActivity;

    if (editActivity) {
      setEditingActivityId(editActivity._id);

      setForm({
        note: editActivity.note || "",
        status: editActivity.status || "Pending",
        nextFollowUpDate: editActivity.nextFollowUpDate
          ? new Date(editActivity.nextFollowUpDate)
              .toISOString()
              .split("T")[0]
          : "",
      });

      // State ko clear kar do
      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location, navigate]);

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // ADD / UPDATE FOLLOW-UP
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.note.trim()) {
      alert("Please enter follow-up note");
      return;
    }

    try {
      setSaving(true);

      // ======================================
      // UPDATE
      // ======================================

      if (editingActivityId) {
        await api.put(
          `/activities/${editingActivityId}`,
          {
            note: form.note,
            status: form.status,
            nextFollowUpDate:
              form.nextFollowUpDate || null,
          }
        );

        alert("Follow-up updated successfully");

        setEditingActivityId(null);
      }

      // ======================================
      // CREATE
      // ======================================

      else {
        await api.post("/activities", {
          client: id,
          note: form.note,
          status: form.status,
          nextFollowUpDate:
            form.nextFollowUpDate || null,
        });

        alert("Follow-up created successfully");
      }

      // ======================================
      // RESET FORM
      // ======================================

      setForm({
        note: "",
        status: "Pending",
        nextFollowUpDate: "",
      });

      await fetchActivities();

    } catch (error) {
      console.error(
        "Save activity error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to save follow-up"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // START EDIT
  // ==========================================

  const handleEdit = (activity) => {
    setEditingActivityId(activity._id);

    setForm({
      note: activity.note || "",
      status: activity.status || "Pending",
      nextFollowUpDate:
        activity.nextFollowUpDate
          ? new Date(activity.nextFollowUpDate)
              .toISOString()
              .split("T")[0]
          : "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const handleCancelEdit = () => {
    setEditingActivityId(null);

    setForm({
      note: "",
      status: "Pending",
      nextFollowUpDate: "",
    });
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

      alert(
        "Follow-up completed successfully"
      );

      await fetchActivities();

    } catch (error) {
      console.error(
        "Complete activity error:",
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

      alert(
        "Follow-up deleted successfully"
      );

      await fetchActivities();

    } catch (error) {
      console.error(
        "Delete activity error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete follow-up"
      );
    }
  };

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
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-message">
          Loading activities...
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="page-container">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="detail-header">

        <div>

          <button
            className="back-btn"
            onClick={() =>
              navigate(`/clients/${id}`)
            }
          >
            ← Back to Client
          </button>

          <h1>Activity Timeline</h1>

          <p>
            Follow-ups, notes and client activities
          </p>

        </div>

      </div>


      {/* ========================================
          ADD / EDIT FOLLOW-UP
      ======================================== */}

      <div className="detail-card">

        <h2>
          {editingActivityId
            ? "Edit Follow-up"
            : "Add Follow-up"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="activity-form"
        >

          {/* NOTE */}

          <div className="form-group">

            <label>Note</label>

            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Enter follow-up details..."
              rows="4"
            />

          </div>


          {/* STATUS + DATE */}

          <div className="activity-form-row">

            <div className="form-group">

              <label>Status</label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >

                <option value="Pending">
                  Pending
                </option>

                <option value="Interested">
                  Interested
                </option>

                <option value="Follow-up">
                  Follow-up
                </option>

                <option value="Converted">
                  Converted
                </option>

                <option value="Closed">
                  Closed
                </option>

                <option value="Not Interested">
                  Not Interested
                </option>

              </select>

            </div>


            <div className="form-group">

              <label>
                Next Follow-up Date
              </label>

              <input
                type="date"
                name="nextFollowUpDate"
                value={form.nextFollowUpDate}
                onChange={handleChange}
              />

            </div>

          </div>


          {/* BUTTONS */}

          <div className="activity-form-actions">

            <button
              type="submit"
              className="view-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingActivityId
                ? "Update Follow-up"
                : "Add Follow-up"}
            </button>


            {editingActivityId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>


      {/* ========================================
          ACTIVITY HISTORY
      ======================================== */}

      <div className="detail-card">

        <h2>Activity History</h2>

        {activities.length === 0 ? (

          <p className="empty-message">
            No activities found.
          </p>

        ) : (

          <div className="timeline">

            {activities.map((activity) => (

              <div
                className="timeline-item"
                key={activity._id}
              >

                <div className="timeline-dot" />


                <div className="timeline-content">

                  {/* HEADER */}

                  <div className="timeline-header">

                    <strong>
                      {activity.status}
                    </strong>

                    <span>
                      {formatDate(
                        activity.createdAt
                      )}
                    </span>

                  </div>


                  {/* NOTE */}

                  <p>
                    {activity.note}
                  </p>


                  {/* NEXT FOLLOW-UP */}

                  {activity.nextFollowUpDate && (
                    <div className="next-followup">

                      Next Follow-up:{" "}

                      <strong>
                        {formatDate(
                          activity.nextFollowUpDate
                        )}
                      </strong>

                    </div>
                  )}


                  {/* CREATED BY */}

                  {activity.createdBy && (
                    <small>

                      Created by:{" "}

                      {activity.createdBy.name ||
                        activity.createdBy.email}

                    </small>
                  )}


                  {/* =================================
                      ACTIVITY ACTIONS
                  ================================= */}

                  <div className="timeline-actions">

                    {/* EDIT */}

                    <button
                      className="edit-btn"
                      onClick={() =>
                        handleEdit(activity)
                      }
                    >
                      Edit
                    </button>


                    {/* COMPLETE */}

                    {activity.status !==
                      "Closed" &&
                      activity.status !==
                        "Converted" && (

                        <button
                          className="complete-btn"
                          onClick={() =>
                            handleComplete(
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
                        handleDelete(
                          activity._id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default ActivityTimeline;