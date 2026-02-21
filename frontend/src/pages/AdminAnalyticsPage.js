import { useEffect, useState } from "react";
import API from "../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminAnalyticsPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await API.get("/admin/analytics");
      setStats(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load analytics");
    }
  };

  if (!stats)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>Loading analytics...</h3>
      </div>
    );

  const chartData = {
    labels: stats.monthlyRevenue.map((item) => item.month),
    datasets: [
      {
        label: "Revenue",
        data: stats.monthlyRevenue.map((item) => item.revenue),
        backgroundColor: "#4CAF50",
        borderRadius: 6,
      },
    ],
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <h2 style={{ marginBottom: "30px" }}>
        📊 Admin Analytics Dashboard
      </h2>

      {/* STAT CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        <StatCard title="Total Orders" value={stats.totalOrders} />
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Total Books" value={stats.totalBooks} />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue}`}
        />
      </div>

      {/* CHART SECTION */}
      <div
        style={{
          marginTop: "50px",
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>
          📈 Monthly Revenue
        </h3>
        <Bar data={chartData} />
      </div>

      {/* TOP BOOKS */}
      <DashboardSection title="🏆 Top Selling Books">
        {stats.topBooks.length === 0 ? (
          <p>No sales data available</p>
        ) : (
          stats.topBooks.map((book, index) => (
            <div
              key={index}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              {book._id} — <strong>{book.totalSold}</strong> sold
            </div>
          ))
        )}
      </DashboardSection>

      {/* LOW STOCK */}
      <DashboardSection title="⚠ Low Stock Books">
        {stats.lowStockBooks.length === 0 ? (
          <p>No low stock books 🎉</p>
        ) : (
          stats.lowStockBooks.map((book) => (
            <div
              key={book._id}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid #eee",
                color: "red",
                fontWeight: "500",
              }}
            >
              {book.title} — {book.stock} left
            </div>
          ))
        )}
      </DashboardSection>
    </div>
  );
};

// COMPONENTS

const StatCard = ({ title, value }) => (
  <div
    style={{
      background: "#222",
      color: "white",
      padding: "25px",
      borderRadius: "12px",
      textAlign: "center",
      boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
    }}
  >
    <h4 style={{ marginBottom: "10px" }}>{title}</h4>
    <h2>{value}</h2>
  </div>
);

const DashboardSection = ({ title, children }) => (
  <div
    style={{
      marginTop: "50px",
      background: "#fff",
      padding: "25px",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    }}
  >
    <h3 style={{ marginBottom: "15px" }}>{title}</h3>
    {children}
  </div>
);

export default AdminAnalyticsPage;