const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
  },
  discountPercent: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  startsAt: {
    type: Date,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  redeemedBy: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    default: [],
  },
});

module.exports = mongoose.model("Promotion", promotionSchema);
