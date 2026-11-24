import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    address: "",
    email: "",
    mobileNumber: "",
    district: "",
    state: "",
    dataSource: "",
    industryType: "",
    gstNumber: "",
    msmeType: "",
    investmentCost: "",
    pcbNocValidity: "",
    cgwaNocValidity: "",
    othersValidity: "",
    notes: "",
  });

  // ==========================================
  // GET CLIENT
  // ==========================================

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/clients/${id}`);

        const client = response.data.client;

        setFormData({
          companyName: client.companyName || "",
          address: client.address || "",
          email: client.email || "",
          mobileNumber: client.mobileNumber || "",
          district: client.district || "",
          state: client.state || "",
          dataSource: client.dataSource || "",
          industryType: client.industryType || "",
          gstNumber: client.gstNumber || "",
          msmeType: client.msmeType || "",
          investmentCost: client.investmentCost || "",
          pcbNocValidity: client.pcbNocValidity
            ? client.pcbNocValidity.substring(0, 10)
            : "",
          cgwaNocValidity: client.cgwaNocValidity
            ? client.cgwaNocValidity.substring(0, 10)
            : "",
          othersValidity: client.othersValidity
            ? client.othersValidity.substring(0, 10)
            : "",
          notes: client.notes || "",
        });
      } catch (err) {
        console.error("Get client error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load client"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // UPDATE CLIENT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const data = {
        ...formData,
        investmentCost:
          formData.investmentCost === ""
            ? undefined
            : Number(formData.investmentCost),
      };

      await api.put(`/clients/${id}`, data);

      alert("Client updated successfully!");

      navigate(`/clients/${id}`);
    } catch (err) {
      console.error("Update client error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update client"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading client...</p>
      </div>
    );
  }

  return (
    <div className="page-container">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <button
            className="back-btn"
            onClick={() => navigate(`/clients/${id}`)}
          >
            ← Back
          </button>

          <h1>Edit Client</h1>

          <p>
            Update client information
          </p>
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* FORM */}

      <form
        className="client-form"
        onSubmit={handleSubmit}
      >

        {/* COMPANY INFORMATION */}

        <div className="detail-card">

          <h2>Company Information</h2>

          <div className="form-grid">

            <div className="form-group">
              <label>Company Name *</label>

              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Mobile Number</label>

              <input
                type="text"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Address</label>

              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>District</label>

              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>State</label>

              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Data Source</label>

              <input
                type="text"
                name="dataSource"
                value={formData.dataSource}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Industry Type</label>

              <input
                type="text"
                name="industryType"
                value={formData.industryType}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>GST Number</label>

              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>MSME Type</label>

              <input
                type="text"
                name="msmeType"
                value={formData.msmeType}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Investment Cost</label>

              <input
                type="number"
                name="investmentCost"
                value={formData.investmentCost}
                onChange={handleChange}
              />
            </div>

          </div>
        </div>

        {/* COMPLIANCE */}

        <div className="detail-card">

          <h2>Compliance Information</h2>

          <div className="form-grid">

            <div className="form-group">
              <label>PCB NOC Validity</label>

              <input
                type="date"
                name="pcbNocValidity"
                value={formData.pcbNocValidity}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>CGWA NOC Validity</label>

              <input
                type="date"
                name="cgwaNocValidity"
                value={formData.cgwaNocValidity}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Others Validity</label>

              <input
                type="date"
                name="othersValidity"
                value={formData.othersValidity}
                onChange={handleChange}
              />
            </div>

          </div>
        </div>

        {/* NOTES */}

        <div className="detail-card">

          <h2>Notes</h2>

          <div className="form-group">

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="5"
              placeholder="Enter notes..."
            />

          </div>

        </div>

        {/* ACTIONS */}

        <div className="form-actions">

          <button
            type="button"
            className="cancel-btn"
            onClick={() =>
              navigate(`/clients/${id}`)
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-btn"
            disabled={saving}
          >
            {saving
              ? "Updating..."
              : "💾 Update Client"}
          </button>

        </div>

      </form>
    </div>
  );
};

export default EditClient;