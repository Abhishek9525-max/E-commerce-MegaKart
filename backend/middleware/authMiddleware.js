const jwt = require("jsonwebtoken");
const User = require("../models/User");

//Middleware to protect routes

const protect = async (req, resizeBy, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.user.id).select("-password"); //Exclude password
      next();
    } catch (error) {
      console.error("Token verification failed", error);
      resizeBy.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

module.exports = { protect };
