const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");
const { createChatRateLimit } = require("../middleware/chatRateLimit");
const {
  handleChat,
  handleOrderStatus,
  isOrderStatusRequest,
  normalizeHistory,
} = require("../utils/chatbot");

const router = express.Router();
const chatRateLimit = createChatRateLimit();

const runChat = (req, res, next) =>
  handleChat(req, res, { Product, Order }).catch(next);

router.post("/", chatRateLimit, (req, res, next) => {
  const history = normalizeHistory(req.body?.history);
  if (isOrderStatusRequest(req.body?.message || "", history)) {
    return protect(req, res, () => runChat(req, res, next));
  }
  return runChat(req, res, next);
});

router.post("/order-status", chatRateLimit, protect, (req, res, next) =>
  handleOrderStatus(req, res, { Order }).catch(next)
);

module.exports = router;
