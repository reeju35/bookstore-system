import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchOrders = async (start = "", end = "") => {
    try {
      let url = "/orders/myorders";

      if (start && end) {
        url += `?startDate=${start}&endDate=${end}`;
      }

      const { data } = await API.get(url);
      setOrders(data);
    } catch {
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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

  return (
    <div style={{ padding: "30px" }}>
      <h2>📦 My Orders</h2>

      {/* DATE FILTER */}
      <div style={{ marginBottom: "20px" }}>
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

        <button onClick={handleFilter} style={btn}>
          Filter
        </button>

        <button onClick={handleReset} style={btn}>
          Reset
        </button>
      </div>

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} style={card}>
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Total:</strong> ₹{order.totalPrice}</p>
            <p><strong>Status:</strong> {order.status}</p>

            <Link to={`/order/${order._id}`}>View Details</Link>
          </div>
        ))
      )}
    </div>
  );
};

const btn = {
  marginLeft: "10px",
  padding: "6px 12px",
  background: "#4f46e5",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const card = {
  background: "white",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "15px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};

export default MyOrdersPage;