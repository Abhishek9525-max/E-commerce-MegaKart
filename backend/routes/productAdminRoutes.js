const express = require("express")
const Product = require("../models/Product")
const {protect,admin} = require("../middleware/authMiddleware")

const router = express.Router();

// @route POST /api/admin/products
// @desc Create a product (admin only)
router.post("/", protect, admin, async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      isPublished: req.body.isFeatured ? true : req.body.isPublished ?? true,
      user: req.user._id,
    });
    res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A product with this SKU already exists." });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Failed to create admin product:", error);
    res.status(500).json({ message: "Unable to create product." });
  }
});

// @route PUT /api/admin/products/:id
// @desc Update a product (admin only)
router.put("/:id", protect, admin, async (req, res) => {
  const editableFields = [
    "name",
    "description",
    "price",
    "discountPrice",
    "countInStock",
    "sku",
    "category",
    "brand",
    "sizes",
    "colors",
    "collections",
    "material",
    "gender",
    "images",
    "isFeatured",
    "isPublished",
    "tags",
    "dimensions",
    "weight",
  ];
  const updates = {};

  editableFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field];
    }
  });

  if (updates.isFeatured === true) {
    updates.isPublished = true;
  } else if (updates.isPublished === false) {
    updates.isFeatured = false;
  }

  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A product with this SKU already exists." });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Failed to update admin product:", error);
    res.status(500).json({ message: "Unable to update product." });
  }
});

// @route GET /api/admin/products/:id
// @desc Get a product including unpublished products (admin only)
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json(product);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    console.error("Failed to load admin product:", error);
    res.status(500).json({ message: "Unable to load product." });
  }
});

// @route GET /api/admin/product
// @desc Get all products (admin only)
// @desc Private/Admin

router.get("/", protect, admin ,async(req,res)=>{
  try{
    const product = await Product.find({});
    res.json(product);
  }catch(error){
    console.error(error);
    res.status(500).json({message: "Server Error"});
  }
});

module.exports= router;