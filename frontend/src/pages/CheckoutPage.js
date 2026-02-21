// FULL UPDATED CHECKOUT WITH SHIPPING FORM
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [shipping, setShipping] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart);
  }, []);

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!shipping.address || !shipping.city || !shipping.phone) {
      toast.error("Please fill all shipping details");
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Razorpay failed to load");
      return;
    }

    try {
      const { data: razorpayOrder } = await API.post(
        "/orders/create-payment",
        { amount: totalAmount }
      );

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: "INR",
        order_id: razorpayOrder.id,

        handler: async function (response) {
          const { data: createdOrder } = await API.post("/orders", {
            orderItems: cartItems.map((item) => ({
              book: item._id,
              quantity: item.qty,
            })),
            shippingAddress: shipping,
          });

          await API.post("/orders/verify-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: createdOrder._id,
          });

          localStorage.removeItem("cart");
          toast.success("Payment Successful 🎉");
          navigate(`/order/${createdOrder._id}`);
        },
      };

      new window.Razorpay(options).open();
    } catch {
      toast.error("Payment failed");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>💳 Checkout</h2>

      <h3>Shipping Address</h3>

      {Object.keys(shipping).map((key) => (
        <input
          key={key}
          name={key}
          placeholder={key}
          value={shipping[key]}
          onChange={handleChange}
          style={{
            width: "100%",
            marginBottom: "10px",
            padding: "8px",
          }}
        />
      ))}

      <h3>Total: ₹{totalAmount}</h3>

      <button
        onClick={handlePayment}
        style={{
          marginTop: "20px",
          padding: "10px",
          width: "100%",
          background: "#4f46e5",
          color: "white",
          border: "none",
        }}
      >
        Pay Now
      </button>
    </div>
  );
};

export default CheckoutPage;