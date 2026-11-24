import { useEffect, useState } from "react";
import api from "../services/api";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [followUps, setFollowUps] = useState(null);
  const [reminders, setReminders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD DASHBOARD DATA
  // ==========================================
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          summaryResponse,
          funnelResponse,
          followUpResponse,
          reminderResponse,
        ] = await Promise.all([
          api.get("/clients/dashboard/summary"),
          api.get("/clients/dashboard/funnel"),
          api.get("/activities/summary"),
          api.get("/reminders/today"),
        ]);

        setSummary(summaryResponse.data);
        setFunnel(funnelResponse.data);
        setFollowUps(followUpResponse.data);
        setReminders(reminderResponse.data.reminders || []);
      } catch (error) {
        console.error("Dashboard error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div style={styles.center}>
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================
  if (error) {
    return (
      <div style={styles.center}>
        <h2>Dashboard Error</h2>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  // ==========================================
  // DATA
  // ==========================================
  const summaryData = summary?.summary || summary || {};
  const funnelData = funnel?.funnel || funnel || {};
  const followUpData =
    followUps?.summary || followUps || {};

  return (
    <div style={styles.container}>
      {/* ======================================
          HEADER
      ====================================== */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            CRM Dashboard
          </h1>

          <p style={styles.subtitle}>
            Client Compliance Management System
          </p>
        </div>

        <button
          style={styles.logoutButton}
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>

      {/* ======================================
          ERROR MESSAGE
      ====================================== */}
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* ======================================
          SUMMARY CARDS
      ====================================== */}
      <div style={styles.cards}>

        <Card
          title="Total Clients"
          value={
            summaryData.totalClients ??
            summaryData.clients ??
            0
          }
        />

        <Card
          title="Upcoming Expiry"
          value={
            summaryData.upcomingExpiries ??
            summaryData.upcomingExpiry ??
            0
          }
        />

        <Card
          title="Expired NOCs"
          value={
            summaryData.expiredNocs ??
            summaryData.expiredClients ??
            0
          }
        />

        <Card
          title="Today's Follow-ups"
          value={
            followUpData.todayFollowUps ?? 0
          }
        />

      </div>

      {/* ======================================
          CONVERSION FUNNEL
      ====================================== */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          Conversion Funnel
        </h2>

        <div style={styles.funnel}>

          <FunnelCard
            title="Leads"
            value={funnelData.leads ?? 0}
          />

          <FunnelCard
            title="Quotes"
            value={funnelData.quotes ?? 0}
          />

          <FunnelCard
            title="Deals"
            value={funnelData.deals ?? 0}
          />

          <FunnelCard
            title="Lost"
            value={funnelData.lost ?? 0}
          />

        </div>
      </section>

      {/* ======================================
          FOLLOW-UP SUMMARY
      ====================================== */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          Follow-up Summary
        </h2>

        <div style={styles.cards}>

          <Card
            title="Today's Follow-ups"
            value={
              followUpData.todayFollowUps ?? 0
            }
          />

          <Card
            title="Upcoming Follow-ups"
            value={
              followUpData.upcomingFollowUps ?? 0
            }
          />

          <Card
            title="Pending"
            value={
              followUpData.pendingFollowUps ?? 0
            }
          />

          <Card
            title="Converted"
            value={
              followUpData.convertedClients ?? 0
            }
          />

        </div>
      </section>

      {/* ======================================
          TODAY'S REMINDERS
      ====================================== */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          Today's Reminders
        </h2>

        {reminders.length === 0 ? (
          <div style={styles.empty}>
            No reminders for today 🎉
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>
                    Company
                  </th>

                  <th style={styles.th}>
                    Type
                  </th>

                  <th style={styles.th}>
                    Reminder
                  </th>

                  <th style={styles.th}>
                    Expiry Date
                  </th>

                  <th style={styles.th}>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {reminders.map((reminder) => (
                  <tr key={reminder._id}>
                    <td style={styles.td}>
                      {reminder.client?.companyName ||
                        "N/A"}
                    </td>

                    <td style={styles.td}>
                      {reminder.type}
                    </td>

                    <td style={styles.td}>
                      {reminder.reminderDays} days
                    </td>

                    <td style={styles.td}>
                      {reminder.expiryDate
                        ? new Date(
                            reminder.expiryDate
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "N/A"}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={
                          styles.status
                        }
                      >
                        {reminder.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

// ==========================================
// CARD COMPONENT
// ==========================================
const Card = ({ title, value }) => {
  return (
    <div style={styles.card}>
      <p style={styles.cardTitle}>
        {title}
      </p>

      <h2 style={styles.cardValue}>
        {value}
      </h2>
    </div>
  );
};

// ==========================================
// FUNNEL CARD
// ==========================================
const FunnelCard = ({ title, value }) => {
  return (
    <div style={styles.funnelCard}>
      <h3>{title}</h3>

      <p style={styles.funnelValue}>
        {value}
      </p>
    </div>
  );
};

// ==========================================
// STYLES
// ==========================================
const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
  },

  subtitle: {
    color: "#666",
    marginTop: "8px",
  },

  logoutButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    background: "#dc3545",
    color: "white",
    cursor: "pointer",
  },

  cards: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },

  card: {
    background: "white",
    padding: "22px",
    borderRadius: "10px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  cardTitle: {
    margin: 0,
    color: "#666",
    fontSize: "15px",
  },

  cardValue: {
    marginTop: "10px",
    fontSize: "30px",
    marginBottom: 0,
  },

  section: {
    marginBottom: "30px",
  },

  sectionTitle: {
    marginBottom: "15px",
  },

  funnel: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
  },

  funnelCard: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  funnelValue: {
    fontSize: "28px",
    fontWeight: "bold",
    margin: "10px 0 0",
  },

  tableWrapper: {
    overflowX: "auto",
    background: "white",
    borderRadius: "10px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "15px",
    borderBottom:
      "1px solid #ddd",
  },

  td: {
    padding: "15px",
    borderBottom:
      "1px solid #eee",
  },

  status: {
    padding: "5px 10px",
    borderRadius: "15px",
    background: "#fff3cd",
  },

  empty: {
    background: "white",
    padding: "25px",
    borderRadius: "10px",
    textAlign: "center",
    color: "#666",
  },

  error: {
    background: "#ffe5e5",
    color: "#b00020",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "20px",
  },

  center: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
};

export default Dashboard;