export const getProductPricing = (product) => {
  const price = Number(product?.price) || 0;
  const discountPrice = Number(product?.discountPrice);
  const hasDiscount =
    Number.isFinite(discountPrice) &&
    discountPrice > 0 &&
    discountPrice < price;

  return {
    price: hasDiscount ? discountPrice : price,
    originalPrice: hasDiscount ? price : null,
    hasDiscount,
    discountPercent: hasDiscount
      ? Math.round(((price - discountPrice) / price) * 100)
      : 0,
  };
};
