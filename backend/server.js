require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

connectDB();

const app = express();

/* ================= SECURITY ================= */

app.use(helmet());

// ✅ FIXED CORS CONFIGURATION
const allowedOrigins = [
  "http://localhost:3000",
  "https://bookstore-system-sand.vercel.app", // your Vercel frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
  app.use(limiter);
}

/* ================= ROUTES ================= */

app.get("/", (req, res) => {
  res.send("Bookstore API is running...");
});

app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});