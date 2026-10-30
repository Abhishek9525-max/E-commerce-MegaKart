const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();
const ORDERS_PER_PAGE = 10;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// @route GET /api/admin/orders
// @desc Get all order(Admin only)
// @access Private/Admin

router.get("/", protect, admin, async (req, res) => {
  try {
    const requestedPage = Number.parseInt(req.query.page, 10);
    const page = Number.isInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
    const search = typeof req.query.search === "string"
      ? req.query.search.trim().slice(0, 100)
      : "";
    const orderQuery = {};

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      const matchingUsers = await User.find({
        $or: [{ name: regex }, { email: regex }],
      }).distinct("_id");
      const searchConditions = [
        { status: regex },
        { paymentStatus: regex },
        { paymentMethod: regex },
        { "shippingAddress.address": regex },
        { "shippingAddress.city": regex },
        { "shippingAddress.postalCode": regex },
        { "shippingAddress.country": regex },
        { "orderItems.name": regex },
        { user: { $in: matchingUsers } },
      ];

      if (/^[a-f\d]{1,24}$/i.test(search)) {
        const remainingBits = BigInt(24 - search.length) * 4n;
        const prefixValue = BigInt(`0x${search}`);
        const lowerBound = prefixValue << remainingBits;
        const upperBound = lowerBound + (1n << remainingBits);
        const objectIdLimit = 1n << 96n;
        const idRange = {
          $gte: new mongoose.Types.ObjectId(
            lowerBound.toString(16).padStart(24, "0")
          ),
        };

        if (upperBound < objectIdLimit) {
          idRange.$lt = new mongoose.Types.ObjectId(
            upperBound.toString(16).padStart(24, "0")
          );
        }

        searchConditions.push({ _id: idRange });
      }

      orderQuery.$or = searchConditions;
    }

    const [orders, total, [salesSummary], totalOrders] = await Promise.all([
      Order.find(orderQuery)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * ORDERS_PER_PAGE)
        .limit(ORDERS_PER_PAGE)
        .populate("user", "name email"),
      Order.countDocuments(orderQuery),
      Order.aggregate([{ $group: { _id: null, totalSales: { $sum: "$totalPrice" } } }]),
      Order.countDocuments({}),
    ]);

    res.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / ORDERS_PER_PAGE),
      totalOrders,
      totalSales: salesSummary?.totalSales || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route PUT /api/admin/orders/:id
// @desc Upadate order status
// @access Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name")
    if (order) {
      order.status = req.body.status || order.status;
      order.isDelivered =
        req.body.status === "Delivered" ? true : order.isDelivered;
      order.deliveredAt =
        req.body.status === "Delivered" ? Date.now() : order.deliveredAt;

        const updatedOrder = await order.save() 
        res.json(updatedOrder)
    }else{
      res.status(404).json({message: "Order not found"})
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});


// @route DELETE /api/admin/orders/:id
// @desc Delete an order
// @access Private/Admin
router.delete("/:id", protect,admin,async (req,res)=>{
  try{
    const order = await Order.findById(req.params.id);
    if(order){
      await order.deleteOne();
      res.json({message: "Order removed"});
    }else{
      res.status(404).json({message: "Order not found"});
    }
  }catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
})

module.exports = router;
