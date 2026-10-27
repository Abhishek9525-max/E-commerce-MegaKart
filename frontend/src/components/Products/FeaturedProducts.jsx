import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductGrid from "./ProductGrid";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/featured`,
          { signal: controller.signal }
        );
        setProducts(response.data);
      } catch (requestError) {
        if (!axios.isCancel(requestError)) {
          setError("Unable to load featured products.");
          console.error("Failed to load featured products:", requestError);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchFeaturedProducts();
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <section className="px-4 py-12 lg:px-0">
        <p className="text-center text-sm text-[#77746D]">Loading featured products…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4 py-12 lg:px-0">
        <p role="alert" className="text-center text-sm text-[#A94F38]">{error}</p>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="px-4 py-16 lg:px-0 lg:py-20">
      <div className="container mx-auto">
        <div className="mb-9 text-center">
          <p className="luxury-eyebrow mb-2 text-[#A94F38]">Chosen by our atelier</p>
          <h2 className="text-4xl sm:text-5xl">Featured Pieces</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#77746D]">
            A considered selection of pieces from the MegaKart collection.
          </p>
        </div>
        <ProductGrid products={products} />
      </div>
    </section>
  );
};

export default FeaturedProducts;
