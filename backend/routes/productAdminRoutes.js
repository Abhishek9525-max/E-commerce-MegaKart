const express = require("express")
const Product = require("../models/Product")
const {protect,admin} = require("../middleware/authMiddleware")

const router = express.Router();

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