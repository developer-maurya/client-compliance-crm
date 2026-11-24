import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CreateClient = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
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

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.companyName.trim()) {
      alert("Company Name is required");
      return;
    }

    try {
      setLoading(true);

      api.post("/clients", form);

      alert("Client created successfully");

      navigate("/clients");
    } catch (error) {
      console.error("Create client error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to create client"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <button
            className="back-btn"
            onClick={() => navigate("/clients")}
          >
            ← Back to Clients
          </button>

          <h1>Add Client</h1>

          <p>
            Add a new client to the CRM
          </p>
        </div>
      </div>

      <form
        className="detail-card"
        onSubmit={handleSubmit}
      >

        <h2>Company Information</h2>

        <div className="create-form-grid">

          <div className="form-group">
            <label>Company Name *</label>
            <input
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input
              name="mobileNumber"
              value={form.mobileNumber}
              onChange={handleChange}
              placeholder="Enter mobile number"
            />
          </div>

          <div className="form-group">
            <label>District</label>
            <input
              name="district"
              value={form.district}
              onChange={handleChange}
              placeholder="Enter district"
            />
          </div>

          <div className="form-group">
            <label>State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="Enter state"
            />
          </div>

          <div className="form-group">
            <label>Industry Type</label>
            <input
              name="industryType"
              value={form.industryType}
              onChange={handleChange}
              placeholder="Enter industry"
            />
          </div>

          <div className="form-group">
            <label>Data Source</label>
            <input
              name="dataSource"
              value={form.dataSource}
              onChange={handleChange}
              placeholder="Website, Referral, Lead..."
            />
          </div>

          <div className="form-group">
            <label>GST Number</label>
            <input
              name="gstNumber"
              value={form.gstNumber}
              onChange={handleChange}
              placeholder="Enter GST number"
            />
          </div>

          <div className="form-group">
            <label>MSME Type</label>
            <input
              name="msmeType"
              value={form.msmeType}
              onChange={handleChange}
              placeholder="Enter MSME type"
            />
          </div>

          <input
  type="number"
  name="investmentCost"
  value={form.investmentCost}
  onChange={handleChange}
  placeholder="Enter investment cost"
  min="0"
/>
 
        </div>

        <h2 className="form-section-title">
          Address
        </h2>

        <div className="form-group">
          <label>Address</label>

          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows="3"
            placeholder="Enter complete address"
          />
        </div>

        <h2 className="form-section-title">
          Compliance Validity
        </h2>

        <div className="create-form-grid">

          <div className="form-group">
            <label>PCB NOC Validity</label>

            <input
              type="date"
              name="pcbNocValidity"
              value={form.pcbNocValidity}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>CGWA NOC Validity</label>

            <input
              type="date"
              name="cgwaNocValidity"
              value={form.cgwaNocValidity}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Others Validity</label>

            <input
              type="date"
              name="othersValidity"
              value={form.othersValidity}
              onChange={handleChange}
            />
          </div>

        </div>

        <h2 className="form-section-title">
          Notes
        </h2>

        <div className="form-group">
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Enter notes..."
          />
        </div>

        <div className="form-actions">

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/clients")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="add-client-btn"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Save Client"}
          </button>

        </div>

      </form>
    </div>
  );
};

export default CreateClient;