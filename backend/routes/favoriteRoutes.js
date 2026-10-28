const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "favorites",
      match: { isPublished: { $ne: false } },
    });

    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    res.json(user.favorites.filter(Boolean));
  } catch (error) {
    console.error("Failed to load favorites:", error);
    res.status(500).json({ message: "Unable to load favorites." });
  }
});

router.post("/:productId", protect, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
    return res.status(400).json({ message: "Invalid product ID." });
  }

  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      isPublished: { $ne: false },
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { favorites: product._id } },
      { new: true, projection: { _id: 1 } }
    );
    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    res.json({ productId: product._id, isFavorite: true });
  } catch (error) {
    console.error("Failed to add favorite:", error);
    res.status(500).json({ message: "Unable to add favorite." });
  }
});

router.delete("/:productId", protect, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
    return res.status(400).json({ message: "Invalid product ID." });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { favorites: req.params.productId } },
      { new: true, projection: { _id: 1 } }
    );
    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    res.json({ productId: req.params.productId, isFavorite: false });
  } catch (error) {
    console.error("Failed to remove favorite:", error);
    res.status(500).json({ message: "Unable to remove favorite." });
  }
});

module.exports = router;
