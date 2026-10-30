const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: Number.isInteger,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
    verifiedPurchase: {
      type: Boolean,
      default: true,
      immutable: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index(
  { user: 1, product: 1 },
  { unique: true, name: "user_1_product_1" }
);
reviewSchema.index(
  { product: 1, createdAt: -1 },
  { name: "product_1_createdAt_-1" }
);

module.exports = mongoose.model("Review", reviewSchema);
