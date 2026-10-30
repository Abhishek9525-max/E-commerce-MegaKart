const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Review = require("../models/Review");
const { protect } = require("../middleware/authMiddleware");
const updateProductReviewMetrics = require("../utils/reviewMetrics");

const router = express.Router();
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;
const PAGE_SIZE = 10;

const isValidId = (value) => OBJECT_ID_PATTERN.test(value);

const validateReviewInput = (rating, comment) => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return "Rating must be a whole number from 1 to 5.";
  }
  if (typeof comment !== "string" || !comment.trim() || comment.trim().length > 2000) {
    return "Comment is required and must be 2000 characters or fewer.";
  }
  return null;
};

router.get("/products/:productId", async (req, res) => {
  const { productId } = req.params;
  if (!isValidId(productId)) {
    return res.status(400).json({ message: "Invalid product ID." });
  }

  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  try {
    const product = await Product.exists({ _id: productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const [reviews, [summary]] = await Promise.all([
      Review.find({ product: productId })
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .populate("user", "name"),
      Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId) } },
        {
          $group: {
            _id: null,
            rating: { $avg: "$rating" },
            numReviews: { $sum: 1 },
          },
        },
      ]),
    ]);
    const total = summary?.numReviews || 0;

    res.json({
      reviews: reviews.map((review) => ({
        _id: review._id,
        reviewerName: review.user?.name || "Deleted customer",
        rating: review.rating,
        comment: review.comment,
        verifiedPurchase: review.verifiedPurchase,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      })),
      rating: summary?.rating || 0,
      numReviews: total,
      page,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      total,
    });
  } catch (error) {
    console.error("Failed to load product reviews:", error);
    res.status(500).json({ message: "Unable to load reviews." });
  }
});

router.get("/products/:productId/mine", protect, async (req, res) => {
  const { productId } = req.params;
  if (!isValidId(productId)) {
    return res.status(400).json({ message: "Invalid product ID." });
  }

  try {
    const product = await Product.exists({ _id: productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const [review, deliveredOrder, previousOrder] = await Promise.all([
      Review.findOne({ product: productId, user: req.user._id }),
      Order.exists({
        user: req.user._id,
        status: "Delivered",
        "orderItems.productId": productId,
      }),
      Order.exists({
        user: req.user._id,
        "orderItems.productId": productId,
      }),
    ]);

    res.json({
      review,
      eligible: Boolean(deliveredOrder),
      canReview: Boolean(deliveredOrder) && !review,
      canEdit: Boolean(review),
      message: deliveredOrder
        ? ""
        : previousOrder
          ? "You can review this product once you've received it."
          : "Purchase this product to leave a review. Reviews are available after delivery.",
    });
  } catch (error) {
    console.error("Failed to check product review eligibility:", error);
    res.status(500).json({ message: "Unable to check review eligibility." });
  }
});

router.post("/products/:productId", protect, async (req, res) => {
  const { productId } = req.params;
  if (!isValidId(productId)) {
    return res.status(400).json({ message: "Invalid product ID." });
  }

  const rating = req.body?.rating;
  const comment = typeof req.body?.comment === "string" ? req.body.comment.trim() : req.body?.comment;
  const validationError = validateReviewInput(rating, comment);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const [product, deliveredOrder] = await Promise.all([
      Product.exists({ _id: productId }),
      Order.exists({
        user: req.user._id,
        status: "Delivered",
        "orderItems.productId": productId,
      }),
    ]);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    if (!deliveredOrder) {
      return res.status(403).json({
        message: "A delivered order containing this product is required to review it.",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
      verifiedPurchase: true,
    });
    const productExists = await updateProductReviewMetrics(productId, "create", rating);
    if (!productExists) {
      await Review.deleteOne({ _id: review._id });
      return res.status(404).json({ message: "Product not found." });
    }
    res.status(201).json({ review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already reviewed this product. Edit your existing review instead.",
      });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Failed to create product review:", error);
    res.status(500).json({ message: "Unable to submit review." });
  }
});

router.put("/:reviewId", protect, async (req, res) => {
  const { reviewId } = req.params;
  if (!isValidId(reviewId)) {
    return res.status(400).json({ message: "Invalid review ID." });
  }

  const rating = req.body?.rating;
  const comment = typeof req.body?.comment === "string" ? req.body.comment.trim() : req.body?.comment;
  const validationError = validateReviewInput(rating, comment);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const existingReview = await Review.findOne({
      _id: reviewId,
      user: req.user._id,
    });
    if (!existingReview) {
      return res.status(404).json({ message: "Review not found." });
    }

    const deliveredOrder = await Order.exists({
      user: req.user._id,
      status: "Delivered",
      "orderItems.productId": existingReview.product,
    });
    if (!deliveredOrder) {
      return res.status(403).json({
        message: "A delivered order containing this product is required to edit its review.",
      });
    }

    const previousReview = await Review.findOneAndUpdate(
      { _id: reviewId, user: req.user._id },
      { $set: { rating, comment } },
      { new: false, runValidators: true }
    );
    if (!previousReview) {
      return res.status(404).json({ message: "Review not found." });
    }

    await updateProductReviewMetrics(
      previousReview.product,
      "edit",
      rating,
      previousReview.rating
    );
    const updatedReview = previousReview.toObject();
    updatedReview.rating = rating;
    updatedReview.comment = comment;
    updatedReview.updatedAt = new Date();
    res.json({ review: updatedReview });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Failed to update product review:", error);
    res.status(500).json({ message: "Unable to update review." });
  }
});

router.delete("/:reviewId", protect, async (req, res) => {
  const { reviewId } = req.params;
  if (!isValidId(reviewId)) {
    return res.status(400).json({ message: "Invalid review ID." });
  }

  try {
    const review = await Review.findOneAndDelete({
      _id: reviewId,
      user: req.user._id,
    });
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }
    await updateProductReviewMetrics(
      review.product,
      "delete",
      0,
      review.rating
    );
    res.json({ message: "Review deleted." });
  } catch (error) {
    console.error("Failed to delete product review:", error);
    res.status(500).json({ message: "Unable to delete review." });
  }
});

module.exports = router;
