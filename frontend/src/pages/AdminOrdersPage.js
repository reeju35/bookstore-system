import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  /* ================= FETCH ORDERS ================= */

  const fetchOrders = async (start = "", end = "") => {
    try {
      if (!userInfo || userInfo.role !== "admin") {
        navigate("/");
        return;
      }

      let url = "/orders";

      if (start && end) {
        url += `?startDate=${start}&endDate=${end}`;
      }

      const { data } = await API.get(url);
      setOrders(data);

    } catch {
      toast.error("Failed to load orders");
    }
  };

  /* ================= DEFAULT LOAD (TODAY) ================= */

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ================= STATUS UPDATE ================= */

  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/orders/${id}/status`, { status: newStatus });

      setOrders(
        orders.map((order) =>
          order._id === id ? { ...order, status: newStatus } : order
        )
      );

      toast.success("Status updated successfully");
    } catch {
      toast.error("Failed to update status");
    }
  };

  /* ================= DATE FILTER ================= */

  const handleFilter = () => {
    if (!startDate || !endDate) {
      toast.error("Select both dates");
      return;
    }
    fetchOrders(startDate, endDate);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    fetchOrders();
  };

  /* ================= QUICK FILTERS ================= */

  const getToday = () => {
    const today = new Date().toISOString().split("T")[0];
    fetchOrders(today, today);
  };

  const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = yesterday.toISOString().split("T")[0];
    fetchOrders(date, date);
  };

  const getLast7Days = () => {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 6);

    fetchOrders(
      past.toISOString().split("T")[0],
      today.toISOString().split("T")[0]
    );
  };

  const getThisMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    fetchOrders(
      firstDay.toISOString().split("T")[0],
      today.toISOString().split("T")[0]
    );
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto" }}>
      <h2>📦 Admin - Orders Dashboard</h2>

      {/* DATE FILTER SECTION */}
      <div style={filterBox}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ marginLeft: "10px" }}
        />

        <button onClick={handleFilter} style={filterBtn}>
          Filter
        </button>

        <button onClick={handleReset} style={filterBtn}>
          Reset
        </button>
      </div>

      {/* QUICK FILTER BUTTONS */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={getToday} style={quickBtn}>Today</button>
        <button onClick={getYesterday} style={quickBtn}>Yesterday</button>
        <button onClick={getLast7Days} style={quickBtn}>Last 7 Days</button>
        <button onClick={getThisMonth} style={quickBtn}>This Month</button>
      </div>

      {/* ORDERS LIST */}
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} style={cardStyle}>
            <h4>
              <Link
                to={`/order/${order._id}`}
                style={{ textDecoration: "none", color: "#111" }}
              >
                Order ID: {order._id}
              </Link>
            </h4>

            <p><strong>User:</strong> {order.user?.name}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> ₹{order.totalPrice}</p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>

            <div style={{ marginTop: "10px" }}>
              <button
                disabled={order.status === "Processing"}
                onClick={() => updateStatus(order._id, "Processing")}
                style={statusBtn}
              >
                Processing
              </button>

              <button
                disabled={order.status === "Shipped"}
                onClick={() => updateStatus(order._id, "Shipped")}
                style={statusBtn}
              >
                Shipped
              </button>

              <button
                disabled={order.status === "Delivered"}
                onClick={() => updateStatus(order._id, "Delivered")}
                style={statusBtn}
              >
                Delivered
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

/* ================= STYLES ================= */

const filterBox = {
  marginBottom: "15px",
  padding: "10px",
  background: "#f4f4f4",
  borderRadius: "8px",
};

const filterBtn = {
  marginLeft: "10px",
  padding: "6px 12px",
  background: "#4f46e5",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const quickBtn = {
  marginRight: "10px",
  padding: "6px 12px",
  background: "#111",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const statusBtn = {
  marginRight: "10px",
  padding: "6px 12px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  background: "#222",
  color: "white",
};

const cardStyle = {
  border: "1px solid #ddd",
  padding: "15px",
  marginBottom: "15px",
  borderRadius: "8px",
  background: "#fff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
};

export default AdminOrdersPage;