import React, { useEffect, useState } from "react";
import { HiArrowLeft, HiArrowRight, HiOutlineShoppingBag } from "react-icons/hi2";
import { toast } from "sonner";
import ProductGrid from "./ProductGrid";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductDetails,
  fetchSimilarProducts,
} from "../../redux/slices/productSlice";
import { addToCart } from "../../redux/slices/cartSlice";
import { getProductPricing } from "../../utils/productPricing";
import { getColorSwatchValue } from "../../utils/colorSwatches";

const ProductDetails = ({ productId, showSimilarProducts = true }) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedProduct, loading, error, similarProducts } = useSelector(
    (state) => state.products
  );
  const { user, guestId } = useSelector((state) => state.auth);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const productFetchId = productId || id;

  useEffect(() => {
    if (productFetchId) {
      dispatch(fetchProductDetails(productFetchId));
      if (showSimilarProducts) {
        dispatch(fetchSimilarProducts({ id: productFetchId }));
      }
    }
  }, [dispatch, productFetchId, showSimilarProducts]);

  useEffect(() => {
    setMainImage(selectedProduct?.images?.[0]?.url || "");
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
  }, [selectedProduct]);

  const handleQuantityChange = (change) => {
    setQuantity((currentQuantity) =>
      Math.max(1, currentQuantity + change)
    );
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select a size and color before adding to cart", {
        duration: 1000,
      });
      return;
    }

    setIsButtonDisabled(true);
    dispatch(
      addToCart({
        productId: productFetchId,
        quantity,
        size: selectedSize,
        color: selectedColor,
        guestId,
        userId: user?._id,
      })
    )
      .then(() => {
        toast.success("Product added to cart!", { duration: 1000 });
      })
      .finally(() => {
        setIsButtonDisabled(false);
      });
  };

  if (loading && !selectedProduct) {
    return (
      <p className="px-6 py-12 text-center text-sm text-[#77746D]">
        Loading product...
      </p>
    );
  }

  if (error && !selectedProduct) {
    return (
      <p className="px-6 py-12 text-center text-sm text-[#A94F38]">
        Unable to load product: {error}
      </p>
    );
  }

  if (!selectedProduct) return null;

  const images = selectedProduct.images || [];
  const sizes = selectedProduct.sizes || [];
  const colors = selectedProduct.colors || [];
  const pricing = getProductPricing(selectedProduct);
  const currentPrice = pricing.price;
  const productFacts = [
    { label: "Brand", value: selectedProduct.brand },
    { label: "Material", value: selectedProduct.material },
    { label: "Category", value: selectedProduct.category },
    ...(typeof selectedProduct.countInStock === "number"
      ? [{
          label: "Availability",
          value: selectedProduct.countInStock > 0
            ? `${selectedProduct.countInStock} in stock`
            : "Out of stock",
          isUnavailable: selectedProduct.countInStock === 0,
        }]
      : []),
  ].filter(({ value }) => value);

  return (
    <div className="px-4 pb-8 sm:px-6">
      <article className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-[#EAE6DF] bg-white/90 shadow-sm">
        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-12">
          <div className="flex min-w-0 flex-col-reverse gap-4 sm:flex-row">
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto sm:w-[76px] sm:shrink-0 sm:flex-col sm:overflow-y-auto">
                {images.map((image, index) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    onClick={() => setMainImage(image.url)}
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={mainImage === image.url}
                    className={`h-[72px] w-[60px] shrink-0 overflow-hidden border-2 transition-colors sm:h-[90px] sm:w-[76px] ${
                      mainImage === image.url
                        ? "border-[#414B36]"
                        : "border-transparent hover:border-[#D8D2C8]"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.altText || selectedProduct.name}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="relative aspect-[3/4] w-full max-w-[560px] flex-1 overflow-hidden bg-[#F5F2ED]">
              {mainImage && (
                <img
                  src={mainImage}
                  alt={images.find((image) => image.url === mainImage)?.altText || selectedProduct.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 flex gap-2 sm:hidden">
                  <button
                    type="button"
                    aria-label="Previous product image"
                    onClick={() => {
                      const currentIndex = images.findIndex(
                        (image) => image.url === mainImage
                      );
                      const previousIndex =
                        (currentIndex - 1 + images.length) % images.length;
                      setMainImage(images[previousIndex].url);
                    }}
                    className="flex h-9 w-9 items-center justify-center border border-[#D8D2C8] bg-white/90"
                  >
                    <HiArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next product image"
                    onClick={() => {
                      const currentIndex = images.findIndex(
                        (image) => image.url === mainImage
                      );
                      setMainImage(images[(currentIndex + 1) % images.length].url);
                    }}
                    className="flex h-9 w-9 items-center justify-center border border-[#D8D2C8] bg-white/90"
                  >
                    <HiArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            {(selectedProduct.gender || selectedProduct.category) && (
              <p className="luxury-eyebrow mb-2 text-[10px] text-[#77746D]">
                {[selectedProduct.gender, selectedProduct.category]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            <h1 className="text-3xl leading-tight text-[#171714] sm:text-4xl">
              {selectedProduct.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-xl font-semibold text-[#171714]">
                ${Number(currentPrice).toFixed(2)}
              </span>
              {pricing.originalPrice && (
                <>
                  <span className="text-sm font-medium text-[#99958c] line-through">
                    ${pricing.originalPrice.toFixed(2)}
                  </span>
                  <span className="rounded-sm bg-[#F7E9E5] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#A94F38]">
                    {Math.round(
                      ((pricing.originalPrice - currentPrice) /
                        pricing.originalPrice) *
                        100
                    )}
                    % off
                  </span>
                </>
              )}
            </div>

            {selectedProduct.description && (
              <p className="mt-5 text-sm leading-6 text-[#5C5A54]">
                {selectedProduct.description}
              </p>
            )}

            {colors.length > 0 && (
              <fieldset className="mt-6">
                <legend className="luxury-eyebrow text-[9px] text-[#5C5A54]">
                  {selectedColor ? `Color: ${selectedColor}` : "Color"}
                </legend>
                <div className="mt-2.5 flex flex-wrap gap-2.5">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select ${color}`}
                      aria-pressed={selectedColor === color}
                      className={`h-9 w-9 rounded-xl border bg-white p-0.5 transition-shadow ${
                        selectedColor === color
                          ? "border-[#414B36] ring-1 ring-[#414B36]"
                          : "border-[#D8D2C8] hover:ring-1 hover:ring-[#D8D2C8]"
                      }`}
                    >
                      <span
                        className="block h-full w-full rounded-lg border border-black/10"
                        style={{ background: getColorSwatchValue(color) }}
                      />
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {sizes.length > 0 && (
              <fieldset className="mt-5">
                <legend className="luxury-eyebrow text-[9px] text-[#5C5A54]">
                  Size{selectedSize ? `: ${selectedSize}` : ""}
                </legend>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                      className={`min-w-12 rounded-sm border px-4 py-2 text-xs font-medium transition-colors ${
                        selectedSize === size
                          ? "border-[#414B36] bg-[#414B36] text-white"
                          : "border-[#D8D2C8] text-[#171714] hover:border-[#414B36]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-11 w-fit items-center overflow-hidden rounded-sm border border-[#D8D2C8]">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  aria-label="Decrease quantity"
                  className="h-full px-3 text-[#5C5A54] hover:text-[#171714]"
                >
                  −
                </button>
                <span className="min-w-8 text-center text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  aria-label="Increase quantity"
                  className="h-full px-3 text-[#5C5A54] hover:text-[#171714]"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={
                  isButtonDisabled || selectedProduct.countInStock === 0
                }
                className="luxury-button min-h-11 flex-1 rounded-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <HiOutlineShoppingBag className="h-4 w-4" />
                {isButtonDisabled
                  ? "Adding..."
                  : `Add to cart · $${Number(currentPrice).toFixed(2)}`}
              </button>
            </div>

            {productFacts.length > 0 && (
              <dl className="mt-6 grid grid-cols-1 gap-x-5 gap-y-4 rounded-sm bg-[#F5F2ED] p-4 sm:grid-cols-2">
                {productFacts.map(({ label, value, isUnavailable }) => (
                  <div key={label}>
                    <dt className="luxury-eyebrow text-[8px] text-[#77746D]">
                      {label}
                    </dt>
                    <dd className={`mt-1 text-xs ${isUnavailable ? "font-medium text-[#A94F38]" : "text-[#171714]"}`}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </article>

      {showSimilarProducts && (
        <section className="mx-auto mt-16 max-w-7xl">
          <div className="mb-7 text-center">
            <p className="luxury-eyebrow mb-2 text-[#77746D]">
              {selectedProduct.category || selectedProduct.gender}
            </p>
            <h2 className="text-4xl">You May Also Like</h2>
          </div>
          <ProductGrid
            products={similarProducts}
            loading={loading}
            error={error}
          />
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
