const Promotion = require("../models/Promotion");

const PROMOTION_ID = "megakart-mega15-launch";
const PROMOTION_CODE = "MEGA15";
const PROMOTION_DISCOUNT_PERCENT = 15;
const PROMOTION_DURATION_MS = 2 * 60 * 60 * 1000;

const getPromotion = async () => {
  const existingPromotion = await Promotion.findById(PROMOTION_ID);
  if (existingPromotion) return existingPromotion;

  const startsAt = new Date();
  try {
    return await Promotion.create({
      _id: PROMOTION_ID,
      code: PROMOTION_CODE,
      discountPercent: PROMOTION_DISCOUNT_PERCENT,
      startsAt,
      expiresAt: new Date(startsAt.getTime() + PROMOTION_DURATION_MS),
    });
  } catch (error) {
    if (error.code !== 11000) throw error;

    const promotion = await Promotion.findById(PROMOTION_ID);
    if (!promotion) throw error;
    return promotion;
  }
};

const isPromotionActive = (promotion, now = Date.now()) =>
  promotion.startsAt.getTime() <= now && promotion.expiresAt.getTime() > now;

module.exports = { getPromotion, isPromotionActive };
