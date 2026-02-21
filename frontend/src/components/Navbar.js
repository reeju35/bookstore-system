import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
    setCartCount(totalItems);
  };

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const linkStyle = (path) => ({
    color: location.pathname === path ? "#6366f1" : "white",
    textDecoration: "none",
    fontWeight: 500,
    transition: "0.2s"
  });

  return (
    <nav
  style={{
    height: "70px",
    padding: "0 40px",
    background: "#0f172a",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    boxSizing: "border-box",   // ⭐ IMPORTANT FIX
    zIndex: 1000,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  }}
>
      {/* Logo */}
      <h2
        style={{ margin: 0, cursor: "pointer", fontWeight: 600 }}
        onClick={() => navigate("/")}
      >
        📚 Bookstore
      </h2>

      <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
        <Link style={linkStyle("/")} to="/">Home</Link>

        {userInfo && (
          <Link style={{ ...linkStyle("/cart"), position: "relative" }} to="/cart">
            🛒 Cart
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-14px",
                  background: "#ef4444",
                  color: "white",
                  borderRadius: "50%",
                  padding: "3px 7px",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        )}

        {userInfo ? (
          <>
            <Link style={linkStyle("/myorders")} to="/myorders">
              My Orders
            </Link>

            <Link style={linkStyle("/profile")} to="/profile">
              Profile
            </Link>

            {userInfo.role === "admin" && (
              <>
                <Link style={linkStyle("/admin/books")} to="/admin/books">
                  Manage Books
                </Link>

                <Link style={linkStyle("/admin/orders")} to="/admin/orders">
                  Admin Orders
                </Link>

                <Link style={linkStyle("/admin/analytics")} to="/admin/analytics">
                  Analytics
                </Link>
              </>
            )}

            <span style={{ opacity: 0.7 }}>
              👤 {userInfo.name}
            </span>

            <button
              onClick={logoutHandler}
              style={{
                background: "#ef4444",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                color: "white",
                cursor: "pointer",
                fontWeight: 500,
                transition: "0.2s"
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link style={linkStyle("/login")} to="/login">Login</Link>
            <Link style={linkStyle("/register")} to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;