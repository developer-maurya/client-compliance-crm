import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Clients = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");

  // ==========================================
  // GET CLIENTS
  // ==========================================
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/clients");

      const clientData = response.data.clients || [];

      setClients(clientData);
      setFilteredClients(clientData);
    } catch (error) {
      console.error("Get clients error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load clients"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // ==========================================
  // SEARCH + FILTER
  // ==========================================
  useEffect(() => {
    let result = [...clients];

    // Search
    if (search.trim()) {
      const searchText = search.toLowerCase();

      result = result.filter((client) =>
        [
          client.companyName,
          client.email,
          client.mobileNumber,
          client.gstNumber,
          client.industryType,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(searchText)
          )
      );
    }

    // Status filter
    if (statusFilter) {
      result = result.filter(
        (client) => client.status === statusFilter
      );
    }

    // State filter
    if (stateFilter) {
      result = result.filter(
        (client) => client.state === stateFilter
      );
    }

    // District filter
    if (districtFilter) {
      result = result.filter(
        (client) => client.district === districtFilter
      );
    }

    setFilteredClients(result);
  }, [
    search,
    statusFilter,
    stateFilter,
    districtFilter,
    clients,
  ]);

  // ==========================================
  // UNIQUE STATES
  // ==========================================
  const states = [
    ...new Set(
      clients
        .map((client) => client.state)
        .filter(Boolean)
    ),
  ];

  // ==========================================
  // UNIQUE DISTRICTS
  // ==========================================
  const districts = [
    ...new Set(
      clients
        .map((client) => client.district)
        .filter(Boolean)
    ),
  ];

  // ==========================================
  // CLEAR FILTERS
  // ==========================================
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setStateFilter("");
    setDistrictFilter("");
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="page-container">
        <h2>Clients</h2>
        <p>Loading clients...</p>
      </div>
    );
  }

  return (
    <div className="page-container">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Clients</h1>
          <p>
            Manage and monitor all client information
          </p>
        </div>

        <button
          className="add-client-btn"
          onClick={() => navigate("/clients/create")}
        >
          + Add Client
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* SEARCH + FILTERS */}
      <div className="client-filters">

        <input
          type="text"
          placeholder="Search company, email, mobile, GST..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="">All Status</option>
          <option value="Lead">Lead</option>
          <option value="Quote">Quote</option>
          <option value="Deal">Deal</option>
          <option value="Lost">Lost</option>
        </select>

        <select
          value={stateFilter}
          onChange={(e) =>
            setStateFilter(e.target.value)
          }
        >
          <option value="">All States</option>

          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        <select
          value={districtFilter}
          onChange={(e) =>
            setDistrictFilter(e.target.value)
          }
        >
          <option value="">All Districts</option>

          {districts.map((district) => (
            <option
              key={district}
              value={district}
            >
              {district}
            </option>
          ))}
        </select>

        <button
          className="clear-btn"
          onClick={clearFilters}
        >
          Clear
        </button>

      </div>

      {/* RESULT COUNT */}
      <div className="client-count">
        Showing{" "}
        <strong>{filteredClients.length}</strong>{" "}
        of{" "}
        <strong>{clients.length}</strong> clients
      </div>

      {/* TABLE */}
      <div className="table-container">

        <table className="clients-table">

          <thead>
            <tr>
              <th>Company</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>District</th>
              <th>State</th>
              <th>Industry</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredClients.length === 0 ? (

              <tr>
                <td
                  colSpan="8"
                  className="no-data"
                >
                  No clients found
                </td>
              </tr>

            ) : (

              filteredClients.map((client) => (

                <tr key={client._id}>

                  <td>
                    <strong>
                      {client.companyName}
                    </strong>
                  </td>

                  <td>
                    {client.email || "-"}
                  </td>

                  <td>
                    {client.mobileNumber || "-"}
                  </td>

                  <td>
                    {client.district || "-"}
                  </td>

                  <td>
                    {client.state || "-"}
                  </td>

                  <td>
                    {client.industryType || "-"}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        client.status
                          ? client.status
                              .toLowerCase()
                              .replace(/\s+/g, "-")
                          : "lead"
                      }`}
                    >
                      {client.status || "Lead"}
                    </span>
                  </td>

                  <td>

                    <button
                      className="view-btn"
                      onClick={() =>
                        navigate(
                          `/clients/${client._id}`
                        )
                      }
                    >
                      View
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Clients;