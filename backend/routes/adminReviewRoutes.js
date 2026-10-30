const express = require("express");
const Review = require("../models/Review");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");
const updateProductReviewMetrics = require("../utils/reviewMetrics");

const router = express.Router();
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;
const PAGE_SIZE = 10;

router.get("/products/:productId", protect, admin, async (req, res) => {
  const { productId } = req.params;
  if (!OBJECT_ID_PATTERN.test(productId)) {
    return res.status(400).json({ message: "Invalid product ID." });
  }

  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  try {
    const product = await Product.exists({ _id: productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const [reviews, total] = await Promise.all([
      Review.find({ product: productId })
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .populate("user", "name"),
      Review.countDocuments({ product: productId }),
    ]);
    res.json({
      reviews: reviews.map((review) => ({
        _id: review._id,
        reviewerName: review.user?.name || "Deleted customer",
        rating: review.rating,
        comment: review.comment,
        verifiedPurchase: review.verifiedPurchase,
        createdAt: review.createdAt,
      })),
      page,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      total,
    });
  } catch (error) {
    console.error("Failed to load admin product reviews:", error);
    res.status(500).json({ message: "Unable to load product reviews." });
  }
});

router.delete(
  "/products/:productId/:reviewId",
  protect,
  admin,
  async (req, res) => {
    const { productId, reviewId } = req.params;
    if (!OBJECT_ID_PATTERN.test(productId) || !OBJECT_ID_PATTERN.test(reviewId)) {
      return res.status(400).json({ message: "Invalid product or review ID." });
    }

    try {
      const product = await Product.exists({ _id: productId });
      if (!product) {
        return res.status(404).json({ message: "Product not found." });
      }

      const review = await Review.findOneAndDelete({
        _id: reviewId,
        product: productId,
      });
      if (!review) {
        return res.status(404).json({ message: "Review not found." });
      }

      const productExists = await updateProductReviewMetrics(
        productId,
        "delete",
        0,
        review.rating
      );
      if (!productExists) {
        return res.status(404).json({ message: "Product not found." });
      }
      res.json({ message: "Review deleted." });
    } catch (error) {
      console.error("Failed to moderate product review:", error);
      res.status(500).json({ message: "Unable to delete review." });
    }
  }
);

module.exports = router;
