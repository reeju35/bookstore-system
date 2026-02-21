import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const invoiceRef = useRef();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  /* ================= FETCH ORDER ================= */

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/orders/${id}`);
        setOrder(data);
      } catch (error) {
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  /* ================= UPDATE STATUS ================= */

  const updateStatus = async (newStatus) => {
    try {
      await API.put(`/orders/${id}/status`, { status: newStatus });
      toast.success("Status updated successfully");

      const { data } = await API.get(`/orders/${id}`);
      setOrder(data);
    } catch {
      toast.error("Failed to update status");
    }
  };

  /* ================= DOWNLOAD INVOICE ================= */

  const downloadInvoice = async () => {
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`invoice_${order._id}.pdf`);
    } catch {
      toast.error("Failed to generate invoice");
    }
  };

  /* ================= STATUS TIMELINE ================= */

  const OrderTimeline = ({ status }) => {
    const steps = ["Processing", "Shipped", "Delivered"];

    return (
      <div style={{ display: "flex", alignItems: "center", margin: "25px 0" }}>
        {steps.map((step, index) => {
          const isActive = steps.indexOf(status) >= index;

          return (
            <div key={step} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: isActive ? "#28a745" : "#ccc",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                {index + 1}
              </div>

              <span style={{ marginLeft: "8px", fontWeight: 500 }}>
                {step}
              </span>

              {index < steps.length - 1 && (
                <div
                  style={{
                    height: "4px",
                    background:
                      steps.indexOf(status) > index ? "#28a745" : "#ccc",
                    flex: 1,
                    margin: "0 10px",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;
  if (!order) return <p style={{ padding: "20px" }}>Order not found</p>;

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
      <h2>📦 Order Details</h2>

      <button
        onClick={downloadInvoice}
        style={{
          marginBottom: "20px",
          padding: "8px 14px",
          background: "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Download Invoice
      </button>

      <div
        ref={invoiceRef}
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <h3>📄 Invoice</h3>
        <hr />

        <p><strong>Order ID:</strong> {order._id}</p>

        <p>
          <strong>Payment:</strong>{" "}
          <span
            style={{
              padding: "5px 10px",
              borderRadius: "6px",
              background:
                order.paymentStatus === "Paid" ? "#28a745" : "#dc3545",
              color: "white",
              fontSize: "14px",
            }}
          >
            {order.paymentStatus}
          </span>
        </p>

        <p><strong>Total:</strong> ₹{order.totalPrice}</p>
        <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

        {/* 🚚 SHIPPING ADDRESS */}
        <hr />
        <h3>🚚 Shipping Address</h3>

        {order.shippingAddress && (
          <>
            <p>{order.shippingAddress.address}</p>
            <p>
              {order.shippingAddress.city} -{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            <p>Phone: {order.shippingAddress.phone}</p>
          </>
        )}

        <OrderTimeline status={order.status} />

        <hr />
        <h3>🛒 Items</h3>

        {order.orderItems.map((item, index) => (
          <div
            key={index}
            style={{
              padding: "12px",
              borderBottom: "1px solid #eee",
            }}
          >
            <p><strong>{item.title}</strong></p>
            <p>Quantity: {item.quantity}</p>
            <p>Price: ₹{item.price}</p>
          </div>
        ))}

        <hr />
        <h2>Total: ₹{order.totalPrice}</h2>
      </div>

      {/* ================= ADMIN CONTROLS ================= */}

      {userInfo?.role === "admin" && (
        <div style={{ marginTop: "25px" }}>
          <h4>Update Status</h4>

          <button
            disabled={order.status === "Processing"}
            onClick={() => updateStatus("Processing")}
            style={btn}
          >
            Processing
          </button>

          <button
            disabled={order.status === "Shipped"}
            onClick={() => updateStatus("Shipped")}
            style={btn}
          >
            Shipped
          </button>

          <button
            disabled={order.status === "Delivered"}
            onClick={() => updateStatus("Delivered")}
            style={btn}
          >
            Delivered
          </button>
        </div>
      )}
    </div>
  );
};

const btn = {
  marginRight: "10px",
  padding: "8px 14px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  background: "#111",
  color: "white",
};

export default OrderDetailsPage;