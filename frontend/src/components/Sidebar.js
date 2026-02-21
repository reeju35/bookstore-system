import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menu = [
    { name: "Manage Books", path: "/admin/books", icon: "📚" },
    { name: "Orders", path: "/admin/orders", icon: "📦" },
    { name: "Analytics", path: "/admin/analytics", icon: "📊" }
  ];

  return (
    <div
      style={{
        width: "240px",
        background: "#0f172a",
        color: "white",
        position: "fixed",
        top: "70px",
        left: 0,
        bottom: 0,
        padding: "30px 20px"
      }}
    >
      <h2 style={{ marginBottom: "30px" }}>Admin Panel</h2>

      {menu.map((item) => {
        const active = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: "block",
              padding: "10px 14px",
              marginBottom: "10px",
              borderRadius: "8px",
              textDecoration: "none",
              background: active ? "#4f46e5" : "transparent",
              color: "white",
              fontWeight: active ? "600" : "400"
            }}
          >
            {item.icon} {item.name}
          </Link>
        );
      })}
    </div>
  );
};

export default Sidebar;