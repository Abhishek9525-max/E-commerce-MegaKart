const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
require("./utils/authTokens").validateAuthConfig();

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const subscribeRoutes = require("./routes/subscribeRoute");
const adminRoutes = require("./routes/adminRoutes");
const productAdminRoutes = require("./routes/productAdminRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminReviewRoutes = require("./routes/adminReviewRoutes");
const cookieParser = require("./middleware/cookieMiddleware");
const {
  configuredOrigins,
  requireTrustedOrigin,
} = require("./middleware/csrfMiddleware");

const app = express();
app.use(express.json());
app.use(cors({
  origin(origin, callback) {
    if (!origin || configuredOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed by CORS."));
  },
  credentials: true,
}));
app.use(cookieParser);
app.use(requireTrustedOrigin);

const PORT = process.env.PORT || 3000;

//Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
  res.send("WELCOME TO MEGAKART API");
});

//API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", subscribeRoutes);

// Admin


app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
