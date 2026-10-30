const express = require("express");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const {
  sendAdminNewOrderEmail,
  sendOrderConfirmationEmail,
} = require("../utils/emailService");

const router = express.Router();

// @route POST /api/checkout
// @desc Create a new checkout session
// @access Private

router.post("/", protect, async (req, res) => {
  const { checkoutItems, shippingAddress, paymentMethod } =
    req.body;

  if (!Array.isArray(checkoutItems) || checkoutItems.length === 0) {
    return res.status(400).json({ message: "no items in checkout" }); 
  }
  try {
    if (checkoutItems.some(
      (item) =>
        !mongoose.Types.ObjectId.isValid(item.productId) ||
        !Number.isSafeInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1
    )) {
      return res.status(400).json({ message: "Checkout items must have a valid product and positive whole-number quantity." });
    }

    const requestedProductIds = [
      ...new Set(checkoutItems.map((item) => item.productId?.toString()).filter(Boolean)),
    ];
    const availableProducts = await Product.find({
      _id: { $in: requestedProductIds },
      isPublished: { $ne: false },
    });
    const productsById = new Map(
      availableProducts.map((product) => [product._id.toString(), product])
    );

    if (
      checkoutItems.some(
        (item) => !productsById.has(item.productId?.toString())
      )
    ) {
      return res.status(400).json({
        message: "One or more products are no longer available for purchase.",
      });
    }

    const requestedQuantities = new Map();
    checkoutItems.forEach((item) => {
      const productId = item.productId.toString();
      requestedQuantities.set(
        productId,
        (requestedQuantities.get(productId) || 0) + Number(item.quantity)
      );
    });

    for (const [productId, quantity] of requestedQuantities) {
      const product = productsById.get(productId);
      if (product.countInStock < quantity) {
        return res.status(409).json({
          message: `Only ${product.countInStock} item(s) of ${product.name} are currently available.`,
        });
      }
    }

    const pricedCheckoutItems = checkoutItems.map((item) => {
      const product = productsById.get(item.productId.toString());
      const regularPrice = Number(product.price) || 0;
      const discountPrice = Number(product.discountPrice);
      const unitPrice =
        Number.isFinite(discountPrice) &&
        discountPrice > 0 &&
        discountPrice < regularPrice
          ? discountPrice
          : regularPrice;

      return {
        productId: product._id,
        name: product.name,
        image: product.images[0]?.url || item.image,
        price: unitPrice,
        originalPrice: unitPrice < regularPrice ? regularPrice : undefined,
        quantity: Number(item.quantity),
        size: item.size,
        color: item.color,
      };
    });
    const totalPriceInCents = pricedCheckoutItems.reduce(
      (total, item) => total + Math.round(item.price * 100) * item.quantity,
      0
    );

    // Create a new checkout session
    const newCheckout = await Checkout.create({
      user: req.user._id,
      checkoutItems: pricedCheckoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice: totalPriceInCents / 100,
      paymentStatus: "Pending",
      isPaid: false,
    });
    // console.log(`Checkout created for user ${req.user._id}`);
    res.status(201).json(newCheckout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route PUT /api/checkout/:id/pay
// @desc Update checkout to mark as paid after successfull payment
// @access Private
router.put("/:id/pay", protect, async (req, res) => {
  const { paymentStatus, paymentDetails } = req.body;

  try {
    const checkout = await Checkout.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found " });
    }

    if (paymentStatus === "paid") {
      if (checkout.isFinalized) {
        return res.status(409).json({ message: "Checkout already finalized" });
      }
      checkout.isPaid = true;
      checkout.paymentStatus = paymentStatus;
      checkout.paymentDetails = paymentDetails;
      checkout.paidAt = Date.now();

      await checkout.save();
      res.status(200).json(checkout);
    } else {
      res.status(400).json({ message: "Invalid Payment Status" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route POST /api/checkout/:id/finalize
// @desc Finalize checkout and convert to an order after payment confirmation
// @access Private
router.post("/:id/finalize", protect, async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    let finalOrder;

    await session.withTransaction(async () => {
      const checkout = await Checkout.findOne({
        _id: req.params.id,
        user: req.user._id,
      }).session(session);

      if (!checkout) {
        const error = new Error("Checkout not found.");
        error.statusCode = 404;
        throw error;
      }
      if (checkout.isFinalized) {
        const error = new Error("Checkout already finalized.");
        error.statusCode = 409;
        throw error;
      }
      if (!checkout.isPaid) {
        const error = new Error("Checkout is not paid.");
        error.statusCode = 400;
        throw error;
      }

      const requestedQuantities = new Map();
      checkout.checkoutItems.forEach((item) => {
        const productId = item.productId.toString();
        requestedQuantities.set(
          productId,
          (requestedQuantities.get(productId) || 0) + item.quantity
        );
      });

      for (const [productId, quantity] of requestedQuantities) {
        const stockUpdate = await Product.updateOne(
          { _id: productId, countInStock: { $gte: quantity } },
          { $inc: { countInStock: -quantity } },
          { session }
        );

        if (stockUpdate.matchedCount !== 1) {
          const product = await Product.findById(productId)
            .select("name countInStock")
            .session(session);
          const available = product?.countInStock ?? 0;
          const name = product?.name || "A product";
          const error = new Error(
            `${name} has only ${available} item(s) available; the order requires ${quantity}.`
          );
          error.code = "INSUFFICIENT_STOCK";
          throw error;
        }
      }

      [finalOrder] = await Order.create(
        [{
          user: checkout.user,
          orderItems: checkout.checkoutItems,
          shippingAddress: checkout.shippingAddress,
          paymentMethod: checkout.paymentMethod,
          totalPrice: checkout.totalPrice,
          isPaid: true,
          paidAt: checkout.paidAt,
          isDelivered: false,
          paymentStatus: "paid",
          paymentDetails: checkout.paymentDetails,
        }],
        { session }
      );

      const checkoutUpdate = await Checkout.updateOne(
        { _id: checkout._id, isFinalized: false },
        { $set: { isFinalized: true, finalizedAt: new Date() } },
        { session }
      );
      if (checkoutUpdate.matchedCount !== 1) {
        const error = new Error("Checkout already finalized.");
        error.statusCode = 409;
        throw error;
      }

      await Cart.deleteOne({ user: checkout.user }, { session });
    });

    const user = req.user;
    const emailNotifications = { customer: false, admin: false };

    if (!user) {
      console.error(`Unable to send order emails: customer for order ${finalOrder._id} was not found.`);
    } else {
      try {
        await sendOrderConfirmationEmail(finalOrder, user);
        emailNotifications.customer = true;
      } catch (error) {
        console.error(`Unable to send order confirmation for ${finalOrder._id}:`, error);
      }

      try {
        await sendAdminNewOrderEmail(finalOrder, user);
        emailNotifications.admin = true;
      } catch (error) {
        console.error(`Unable to send admin new-order alert for ${finalOrder._id}:`, error);
      }
    }

    res.status(201).json({
      ...finalOrder.toObject(),
      emailNotifications,
    });
  } catch (error) {
    if (error.code === "INSUFFICIENT_STOCK") {
      return res.status(409).json({ message: error.message });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    if (session) await session.endSession();
  }
});

module.exports = router;
