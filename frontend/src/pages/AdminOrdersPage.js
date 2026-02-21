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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!userInfo || userInfo.role !== "admin") {
          navigate("/");
          return;
        }

        let url = "/orders";

        if (startDate && endDate) {
          url += `?startDate=${startDate}&endDate=${endDate}`;
        }

        const { data } = await API.get(url);
        setOrders(data);
      } catch (error) {
        toast.error("Failed to load orders");
      }
    };

    fetchOrders();
  }, [startDate, endDate, navigate, userInfo]);

  /* ================= UPDATE STATUS ================= */

  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/orders/${id}/status`, { status: newStatus });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, status: newStatus } : order
        )
      );

      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2>📦 Admin - Orders</h2>

      {/* ================= DATE FILTER ================= */}

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button
          onClick={() => {
            setStartDate("");
            setEndDate("");
          }}
          style={buttonStyle}
        >
          Reset
        </button>
      </div>

      {/* ================= ORDERS LIST ================= */}

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            <h4>
              <Link
                to={`/order/${order._id}`}
                style={{ textDecoration: "none", color: "#222" }}
              >
                Order ID: {order._id}
              </Link>
            </h4>

            <p><strong>User:</strong> {order.user?.name}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> ₹{order.totalPrice}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>

            <div style={{ marginTop: "10px" }}>
              <button
                disabled={order.status === "Processing"}
                onClick={() => updateStatus(order._id, "Processing")}
                style={buttonStyle}
              >
                Processing
              </button>

              <button
                disabled={order.status === "Shipped"}
                onClick={() => updateStatus(order._id, "Shipped")}
                style={buttonStyle}
              >
                Shipped
              </button>

              <button
                disabled={order.status === "Delivered"}
                onClick={() => updateStatus(order._id, "Delivered")}
                style={buttonStyle}
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

const buttonStyle = {
  padding: "6px 12px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  background: "#222",
  color: "white",
  marginRight: "10px",
};

export default AdminOrdersPage;