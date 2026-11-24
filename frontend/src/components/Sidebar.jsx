import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaBell,
  FaClipboardList,
  FaChartBar,
  FaUserShield,
} from "react-icons/fa";

const Sidebar = () => {
  const menus = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaHome />,
    },
    {
      name: "Clients",
      path: "/clients",
      icon: <FaUsers />,
    },
    {
      name: "Follow Ups",
      path: "/follow-ups",
      icon: <FaClipboardList />,
    },
    {
      name: "Reminders",
      path: "/reminders",
      icon: <FaBell />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <FaChartBar />,
    },
    {
      name: "Users",
      path: "/users",
      icon: <FaUserShield />,
    },
  ];

  return (
    <div className="sidebar">

      <h2 className="logo">CRM</h2>

      {menus.map((menu) => (
        <NavLink
          key={menu.path}
          to={menu.path}
          className={({ isActive }) =>
            isActive ? "menu active" : "menu"
          }
        >
          {menu.icon}

          <span>{menu.name}</span>
        </NavLink>
      ))}

    </div>
  );
};

export default Sidebar;