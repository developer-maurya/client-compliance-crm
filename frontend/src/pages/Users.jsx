import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Users = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // CREATE USER MODAL
  // ==========================================
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "employee",
  });


  // ==========================================
  // GET CURRENT USER ROLE
  // ==========================================
  const getCurrentUserRole = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) return "";

      const user = JSON.parse(storedUser);

      return user?.role || "";
    } catch (error) {
      console.error("Get current user error:", error);
      return "";
    }
  };

  const currentUserRole = getCurrentUserRole();

  const canCreateUser =
    currentUserRole === "founder" ||
    currentUserRole === "seo";


  // ==========================================
  // FETCH USERS
  // ==========================================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");

      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Fetch users error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // FORM INPUT CHANGE
  // ==========================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ==========================================
  // OPEN CREATE MODAL
  // ==========================================
  const handleOpenCreateModal = () => {
    setError("");
    setSuccess("");

    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "employee",
    });

    setShowCreateModal(true);
  };


  // ==========================================
  // CLOSE CREATE MODAL
  // ==========================================
  const handleCloseCreateModal = () => {
    if (creatingUser) return;

    setShowCreateModal(false);

    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "employee",
    });
  };


  // ==========================================
  // CREATE USER
  // ==========================================
  const handleCreateUser = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.role
    ) {
      setError("Please fill all fields");
      return;
    }

    // Password length
    if (formData.password.length < 6) {
      setError(
        "Password must be at least 6 characters"
      );
      return;
    }

    // Confirm password
    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match");
      return;
    }

    try {
      setCreatingUser(true);

      const response = await api.post("/users", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      setSuccess(
        response.data.message ||
          "User created successfully"
      );

      setShowCreateModal(false);

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "employee",
      });

      await fetchUsers();
    } catch (error) {
      console.error("Create user error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create user"
      );
    } finally {
      setCreatingUser(false);
    }
  };


  // ==========================================
  // UPDATE ROLE
  // ==========================================
  const handleRoleChange = async (
    userId,
    newRole
  ) => {
    try {
      await api.patch(
        `/users/${userId}/role`,
        {
          role: newRole,
        }
      );

      setSuccess(
        "User role updated successfully"
      );

      await fetchUsers();
    } catch (error) {
      console.error(
        "Update role error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update user role"
      );
    }
  };


  // ==========================================
  // STATUS TOGGLE
  // ==========================================
  const handleStatusToggle = async (userId) => {
    try {
      await api.patch(
        `/users/${userId}/status`
      );

      setSuccess(
        "User status updated successfully"
      );

      await fetchUsers();
    } catch (error) {
      console.error(
        "Toggle status error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update user status"
      );
    }
  };


  // ==========================================
  // DELETE USER
  // ==========================================
  const handleDelete = async (
    userId,
    userName
  ) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${userName}?`
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/users/${userId}`);

      setSuccess(
        "User deleted successfully"
      );

      await fetchUsers();
    } catch (error) {
      console.error(
        "Delete user error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete user"
      );
    }
  };


  // ==========================================
  // INITIAL LOAD
  // ==========================================
  useEffect(() => {
    fetchUsers();
  }, []);


  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Users</h1>
            <p>
              Manage CRM users and their
              permissions
            </p>
          </div>
        </div>

        <div className="loading-box">
          Loading users...
        </div>
      </div>
    );
  }


  return (
    <div className="page-container">

      {/* ======================================
          HEADER
      ====================================== */}
      <div className="page-header">

        <div>
          <h1>Users</h1>

          <p>
            Manage users, roles and account
            status
          </p>
        </div>


        <div className="users-header-actions">

          {/* CREATE USER BUTTON */}
          {canCreateUser && (
            <button
              className="primary-btn add-user-btn"
              onClick={handleOpenCreateModal}
            >
              + Add User
            </button>
          )}

          <button
            className="primary-btn"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Back to Dashboard
          </button>

        </div>

      </div>


      {/* ======================================
          SUCCESS
      ====================================== */}
      {success && (
        <div className="success-box">
          {success}
        </div>
      )}


      {/* ======================================
          ERROR
      ====================================== */}
      {error && (
        <div className="error-box">
          {error}
        </div>
      )}


      {/* ======================================
          SUMMARY
      ====================================== */}
      <div className="users-summary">

        <div className="summary-card">
          <span>Total Users</span>

          <strong>
            {users.length}
          </strong>
        </div>


        <div className="summary-card">
          <span>Active Users</span>

          <strong>
            {
              users.filter(
                (user) => user.isActive
              ).length
            }
          </strong>
        </div>


        <div className="summary-card">
          <span>Inactive Users</span>

          <strong>
            {
              users.filter(
                (user) => !user.isActive
              ).length
            }
          </strong>
        </div>

      </div>


      {/* ======================================
          USERS TABLE
      ====================================== */}
      <div className="users-table-container">

        <table className="users-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email / Login ID</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>


          <tbody>

            {users.length === 0 ? (

              <tr>
                <td
                  colSpan="7"
                  className="empty-state"
                >
                  No users found
                </td>
              </tr>

            ) : (

              users.map((user, index) => (

                <tr key={user._id}>

                  <td>
                    {index + 1}
                  </td>


                  <td>
                    <div className="user-name">
                      {user.name}
                    </div>
                  </td>


                  <td>
                    {user.email}
                  </td>


                  <td>

                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(
                          user._id,
                          e.target.value
                        )
                      }
                      className="role-select"
                    >

                      <option value="founder">
                        Founder
                      </option>

                      <option value="seo">
                        SEO
                      </option>

                      <option value="admin">
                        Admin
                      </option>

                      <option value="manager">
                        Manager
                      </option>

                      <option value="sales">
                        Sales
                      </option>

                      <option value="employee">
                        Employee
                      </option>

                    </select>

                  </td>


                  <td>

                    <span
                      className={
                        user.isActive
                          ? "status active"
                          : "status inactive"
                      }
                    >
                      {user.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </td>


                  <td>

                    {user.createdAt
                      ? new Date(
                          user.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "-"}

                  </td>


                  <td>

                    <div className="user-actions">

                      <button
                        className={
                          user.isActive
                            ? "action-btn deactivate-btn"
                            : "action-btn activate-btn"
                        }
                        onClick={() =>
                          handleStatusToggle(
                            user._id
                          )
                        }
                      >
                        {user.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>


                      <button
                        className="action-btn delete-btn"
                        onClick={() =>
                          handleDelete(
                            user._id,
                            user.name
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>


      {/* ======================================
          CREATE USER MODAL
      ====================================== */}
      {showCreateModal && (

        <div className="user-modal-overlay">

          <div className="user-modal">

            {/* MODAL HEADER */}
            <div className="user-modal-header">

              <div>
                <h2>
                  Create New User
                </h2>

                <p>
                  Create a new CRM login ID
                </p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={
                  handleCloseCreateModal
                }
                disabled={creatingUser}
              >
                ×
              </button>

            </div>


            {/* FORM */}
            <form
              onSubmit={handleCreateUser}
              className="create-user-form"
            >

              {/* NAME */}
              <div className="form-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter full name"
                  required
                />

              </div>


              {/* EMAIL */}
              <div className="form-group">

                <label>
                  Email / Login ID
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter email address"
                  required
                />

              </div>


              {/* ROLE */}
              <div className="form-group">

                <label>
                  Role
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={
                    handleInputChange
                  }
                  required
                >

                  <option value="employee">
                    Employee
                  </option>

                  <option value="sales">
                    Sales
                  </option>

                  <option value="manager">
                    Manager
                  </option>

                  <option value="admin">
                    Admin
                  </option>

                  <option value="seo">
                    SEO
                  </option>

                  <option value="founder">
                    Founder
                  </option>

                </select>

              </div>


              {/* PASSWORD */}
              <div className="form-group">

                <label>
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={
                    handleInputChange
                  }
                  placeholder="Minimum 6 characters"
                  minLength="6"
                  required
                />

              </div>


              {/* CONFIRM PASSWORD */}
              <div className="form-group">

                <label>
                  Confirm Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={
                    formData.confirmPassword
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Confirm password"
                  minLength="6"
                  required
                />

              </div>


              {/* BUTTONS */}
              <div className="create-user-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={
                    handleCloseCreateModal
                  }
                  disabled={creatingUser}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="create-user-btn"
                  disabled={creatingUser}
                >
                  {creatingUser
                    ? "Creating..."
                    : "Create User"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Users;