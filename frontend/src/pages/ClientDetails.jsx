
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ==========================================
  // GET CLIENT DETAIL
  // ==========================================
  const fetchClient = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/clients/${id}`);

      setClient(response.data.client);
    } catch (error) {
      console.error("Get client detail error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load client details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  // ==========================================
  // UPDATE STATUS
  // ==========================================
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;

    try {
      setUpdatingStatus(true);

      const response = await api.patch(
        `/clients/${id}/status`,
        {
          status: newStatus,
        }
      );

      setClient(response.data.client);

      alert("Client status updated successfully");
    } catch (error) {
      console.error("Status update error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update status"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ==========================================
  // DELETE CLIENT
  // ==========================================
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${client.companyName}?`
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);

      await api.delete(`/clients/${id}`);

      alert("Client deleted successfully");

      navigate("/clients");
    } catch (error) {
      console.error("Delete client error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete client"
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="page-container">
        <p>Loading client details...</p>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================
  if (error) {
    return (
      <div className="page-container">
        <button
          className="back-btn"
          onClick={() => navigate("/clients")}
        >
          ← Back to Clients
        </button>

        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="page-container">
        <p>Client not found.</p>
      </div>
    );
  }

  return (
    <div className="page-container">

      {/* ==================================
          HEADER
      ================================== */}

      <div className="detail-header">

        <div>
          <button
            className="back-btn"
            onClick={() => navigate("/clients")}
          >
            ← Back to Clients
          </button>

          <h1>{client.companyName}</h1>

          <p>
            Client compliance profile
          </p>
        </div>

        <div className="detail-header-actions">

          {/* STATUS */}

          <select
            value={client.status || "Lead"}
            onChange={handleStatusChange}
            disabled={updatingStatus}
            className="status-select"
          >
            <option value="Lead">Lead</option>
            <option value="Quote">Quote</option>
            <option value="Deal">Deal</option>
            <option value="Lost">Lost</option>
          </select>

          {/* EDIT */}

          <button
            className="edit-btn"
            onClick={() =>
              navigate(`/clients/${client._id}/edit`)
            }
          >
            ✏️ Edit
          </button>

          {/* DELETE */}

          <button
            className="delete-btn"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting
              ? "Deleting..."
              : "🗑️ Delete"}
          </button>

        </div>
      </div>


      {/* ==================================
          COMPANY INFORMATION
      ================================== */}

      <div className="detail-card">

        <h2>Company Information</h2>

        <div className="detail-grid">

          <DetailItem
            label="Company Name"
            value={client.companyName}
          />

          <DetailItem
            label="Email"
            value={client.email}
          />

          <DetailItem
            label="Mobile Number"
            value={client.mobileNumber}
          />

          <DetailItem
            label="Address"
            value={client.address}
          />

          <DetailItem
            label="District"
            value={client.district}
          />

          <DetailItem
            label="State"
            value={client.state}
          />

          <DetailItem
            label="Data Source"
            value={client.dataSource}
          />

          <DetailItem
            label="Industry Type"
            value={client.industryType}
          />

          <DetailItem
            label="GST Number"
            value={client.gstNumber}
          />

          <DetailItem
            label="MSME Type"
            value={client.msmeType}
          />

          <DetailItem
            label="Investment Cost"
            value={
              client.investmentCost !== undefined &&
              client.investmentCost !== null
                ? `₹ ${client.investmentCost}`
                : "-"
            }
          />

        </div>
      </div>


      {/* ==================================
          COMPLIANCE INFORMATION
      ================================== */}

      <div className="detail-card">

        <h2>Compliance Information</h2>

        <div className="detail-grid">

          <DetailItem
            label="PCB NOC Validity"
            value={formatDate(
              client.pcbNocValidity
            )}
          />

          <DetailItem
            label="CGWA NOC Validity"
            value={formatDate(
              client.cgwaNocValidity
            )}
          />

          <DetailItem
            label="Others Validity"
            value={formatDate(
              client.othersValidity
            )}
          />

        </div>
      </div>


      {/* ==================================
          NOTES
      ================================== */}

      <div className="detail-card">

        <h2>Notes</h2>

        <p className="client-notes">
          {client.notes ||
            "No notes available."}
        </p>

      </div>


      {/* ==================================
          ACTIONS
      ================================== */}

      <div className="detail-actions">

        <button
          className="back-btn"
          onClick={() =>
            navigate("/clients")
          }
        >
          ← Back to Clients
        </button>

        <button
          className="view-btn"
          onClick={() =>
            navigate(
              `/clients/${client._id}/activities`
            )
          }
        >
          📋 Activity Timeline
        </button>

        <button
          className="edit-btn"
          onClick={() =>
            navigate(
              `/clients/${client._id}/edit`
            )
          }
        >
          ✏️ Edit Client
        </button>

      </div>

    </div>
  );
};


// ==========================================
// DETAIL ITEM
// ==========================================

const DetailItem = ({ label, value }) => {
  return (
    <div className="detail-item">

      <span className="detail-label">
        {label}
      </span>

      <strong>
        {value || "-"}
      </strong>

    </div>
  );
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

export default ClientDetails;

