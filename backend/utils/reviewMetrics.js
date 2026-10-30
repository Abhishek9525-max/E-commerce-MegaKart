const Product = require("../models/Product");

const updateProductReviewMetrics = async (
  productId,
  operation,
  rating,
  previousRating = 0
) => {
  const count = { $ifNull: ["$numReviews", 0] };
  const average = { $ifNull: ["$rating", 0] };
  let updates;

  if (operation === "create") {
    const nextCount = { $add: [count, 1] };
    updates = {
      numReviews: nextCount,
      rating: {
        $cond: [
          { $eq: [count, 0] },
          rating,
          {
            $divide: [
              { $add: [{ $multiply: [average, count] }, rating] },
              nextCount,
            ],
          },
        ],
      },
    };
  } else if (operation === "edit") {
    updates = {
      rating: {
        $cond: [
          { $gt: [count, 0] },
          {
            $divide: [
              {
                $add: [
                  { $multiply: [average, count] },
                  rating - previousRating,
                ],
              },
              count,
            ],
          },
          0,
        ],
      },
    };
  } else {
    const nextCount = { $max: [{ $subtract: [count, 1] }, 0] };
    updates = {
      numReviews: nextCount,
      rating: {
        $cond: [
          { $gt: [count, 1] },
          {
            $divide: [
              {
                $subtract: [
                  { $multiply: [average, count] },
                  previousRating,
                ],
              },
              nextCount,
            ],
          },
          0,
        ],
      },
    };
  }

  const result = await Product.updateOne(
    { _id: productId },
    [{ $set: updates }]
  );
  return result.matchedCount > 0;
};

module.exports = updateProductReviewMetrics;
