const express = require("express");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

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
    console.log(`Checkout created for user ${req.user._id}`);
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
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found " });
    }

    if (paymentStatus === "paid") {
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
  try {
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) {
      return res.status(404).json({ message: " Checkout not found" });
    }

    if (checkout.isPaid && !checkout.isFinalized) {
      // Create final order based on the checkout details
      const finalOrder = await Order.create({
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
      });

      // Mark the checkout as finalized
      checkout.isFinalized = true;
      checkout.finalizedAt = Date.now();
      await checkout.save();

      // Delete the cart associated with the user
      await Cart.findOneAndDelete({ user: checkout.user });
      res.status(201).json(finalOrder);
    } else if (checkout.isFinalized) {
      res.status(400).json({ message: "Checkout already finalized" });
    } else {
      res.status(400).json({ message: "Checkout is not paid" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
