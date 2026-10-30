import React from "react";
import { Link } from "react-router-dom";
import { FiStar } from "react-icons/fi";
import { getProductPricing } from "../../utils/productPricing";
import FavoriteButton from "./FavoriteButton";

const ProductGrid = ({ products, loading, error }) => {
  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {products.map((product) => {
        const pricing = getProductPricing(product);
        return (
          <article
            key={product._id}
            className="group relative h-full min-w-0 bg-white p-3 transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(23,23,20,0.08)] sm:p-4"
          >
              <div className="relative mb-4 aspect-[3/4] w-full overflow-hidden bg-[#F0EDE7]">
                <Link
                  to={`/product/${product._id}`}
                  aria-label={`View ${product.name}`}
                  className="block h-full w-full"
                >
                {product.images?.[0]?.url && (
                  <img
                    src={product.images[0].url}
                    alt={product.images[0].altText || product.name}
                    className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                )}
                </Link>
                <FavoriteButton
                  product={product}
                  className="absolute right-2 top-2"
                />
                {pricing.hasDiscount && (
                  <span className="absolute left-3 top-3 bg-[#A94F38] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {pricing.discountPercent}% off
                  </span>
                )}
              </div>
              <Link to={`/product/${product._id}`} className="block">
                <h3 className="mb-2 line-clamp-2 min-h-10 font-sans text-sm font-medium text-[#171714]">
                  {product.name}
                </h3>
                <p className="flex flex-wrap items-baseline gap-2 font-sans text-sm font-medium tracking-wide text-[#77746D]">
                  <span className={pricing.hasDiscount ? "text-[#A94F38]" : ""}>
                    ${pricing.price.toFixed(2)}
                  </span>
                  {pricing.originalPrice && (
                    <span className="text-xs font-normal text-[#99958c] line-through">
                      ${pricing.originalPrice.toFixed(2)}
                    </span>
                  )}
                </p>
                {Number(product.numReviews) > 0 && (
                  <p
                    aria-label={`${(Number(product.rating) || 0).toFixed(1)} out of 5 stars from ${product.numReviews} reviews`}
                    className="mt-2 flex items-center gap-1.5 text-xs text-[#77746D]"
                  >
                    <FiStar aria-hidden="true" className="h-3.5 w-3.5 fill-[#b7792b] text-[#b7792b]" />
                    <span className="font-medium text-[#414B36]">
                      {(Number(product.rating) || 0).toFixed(1)}
                    </span>
                    <span>
                      ({product.numReviews} {Number(product.numReviews) === 1 ? "review" : "reviews"})
                    </span>
                  </p>
                )}
              </Link>
          </article>
        );
      })}
    </div>
  );
};

export default ProductGrid;
