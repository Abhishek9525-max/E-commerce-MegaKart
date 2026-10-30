const jwt = require("jsonwebtoken");
const User = require("../models/User");

const ACCESS_COOKIE = "accessToken";

const protect = async (req, res, next) => {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tokenType !== "access" || !decoded.user?.id) {
      return res.status(401).json({ message: "Invalid authentication session." });
    }

    req.user = await User.findById(decoded.user.id)
      .select("-password +sessionVersion");
    if (!req.user) {
      return res.status(401).json({ message: "User account no longer exists." });
    }
    if ((decoded.user.authVersion || 0) !== (req.user.sessionVersion || 0)) {
      return res.status(401).json({ message: "Authentication session has been revoked." });
    }
    return next();
  } catch (error) {
    if (error.name !== "JsonWebTokenError" && error.name !== "TokenExpiredError") {
      console.error("Authentication check failed:", error);
      return res.status(500).json({ message: "Unable to verify authentication." });
    }
    return res.status(401).json({ message: "Authentication session expired." });
  }
};

//Middleware to check if the user is an admin

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

module.exports = { protect, admin };
