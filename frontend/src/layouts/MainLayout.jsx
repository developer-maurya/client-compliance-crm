import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="layout">

      <Sidebar />

      <div className="content">
        <Navbar />

        {/* Current page yahan render hoga */}
        <Outlet />
      </div>

    </div>
  );
};

export default MainLayout;