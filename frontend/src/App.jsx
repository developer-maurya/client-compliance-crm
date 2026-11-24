import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =========================
// PAGES
// =========================
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import ActivityTimeline from "./pages/ActivityTimeline";
import CreateClient from "./pages/CreateClient";
import EditClient from "./pages/EditClient";
import FollowUps from "./pages/FollowUps";
import Reminders from "./pages/Reminders";
import Reports from "./pages/Reports";
import Users from "./pages/Users";

// =========================
// COMPONENTS
// =========================
import ProtectedRoute from "./components/ProtectedRoute";

// =========================
// LAYOUT
// =========================
import MainLayout from "./layouts/MainLayout";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =========================
            PROTECTED ROUTES
        ========================= */}

        <Route element={<ProtectedRoute />}>

          <Route element={<MainLayout />}>

            {/* =========================
                DASHBOARD
            ========================= */}

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* =========================
                CLIENTS
            ========================= */}

            <Route
              path="/clients"
              element={<Clients />}
            />

            {/* CREATE CLIENT */}

            <Route
              path="/clients/create"
              element={<CreateClient />}
            />

            {/* EDIT CLIENT */}

            <Route
              path="/clients/:id/edit"
              element={<EditClient />}
            />

            {/* CLIENT DETAILS */}

            <Route
              path="/clients/:id"
              element={<ClientDetails />}
            />

            {/* =========================
                FOLLOW UPS
            ========================= */}

            <Route
              path="/follow-ups"
              element={<FollowUps />}
            />

            {/* =========================
                ACTIVITY TIMELINE
            ========================= */}

            <Route
              path="/clients/:id/activities"
              element={<ActivityTimeline />}
            />

            {/* =========================
                REMINDERS
            ========================= */}

            <Route
              path="/reminders"
              element={<Reminders />}
            />

            {/* =========================
                REPORTS
            ========================= */}

            <Route
              path="/reports"
              element={<Reports />}
            />

            {/* =========================
                USERS
            ========================= */}

            <Route
              path="/users"
              element={<Users />}
            />

          </Route>

        </Route>

        {/* =========================
            DEFAULT ROUTE
        ========================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;