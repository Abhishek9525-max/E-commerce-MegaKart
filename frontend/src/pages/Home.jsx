import React, { useEffect, useState } from "react";
import Hero from "../components/Layout/Hero";
import TrustBar from "../components/Layout/TrustBar";
import GenderCollectionSection from "../components/Products/GenderCollectionSection";
import NewArrivals from "../components/Products/NewArrivals";
import ProductDetails from "../components/Products/ProductDetails";
import ProductGrid from "../components/Products/ProductGrid";
import FeaturedCollection from "../components/Products/FeaturedCollection";
import FeaturesSection from "../components/Products/FeaturesSection";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByFilters } from "../redux/slices/productSlice";
import axios from "axios";

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const [bestSellerProduct, setBestSellerProduct] = useState(null);

  useEffect(() => {
    // Fetch products for a specific collection
    dispatch(
      fetchProductsByFilters({
        gender: "Women",
        category: "Bottom Wear",
        limit: 8,
      })
    );
    //Fetch best seller product
    const fetchBestSeller = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`
        );
        setBestSellerProduct(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchBestSeller();
  }, [dispatch]);
  return (
    <div>
      <Hero />
      <TrustBar />
      <GenderCollectionSection />
      <NewArrivals />

      <section id="best-seller" className="scroll-mt-32 py-12">
        <div className="mx-auto mb-8 max-w-3xl px-4 text-center">
          <p className="luxury-eyebrow mb-2 text-[#A94F38]">The considered edit</p>
          <h2 className="text-4xl sm:text-5xl">Best Seller</h2>
        </div>
        {bestSellerProduct ? (
          <ProductDetails productId={bestSellerProduct._id} showReviews={false} />
        ) : (
          <p className="text-center text-sm text-[#77746D]">
            Loading best seller product...
          </p>
        )}
      </section>

      <div className="bg-[#FCF9F8] px-4 py-8 sm:py-10">
        <div className="mx-auto mb-8 max-w-5xl text-center">
          <p className="luxury-eyebrow mb-2 text-[#A94F38]">Wardrobe foundations</p>
          <h2 className="text-4xl sm:text-5xl">
            Top Wear &amp; Bottom Wear for Women
          </h2>
          <p className="mx-auto mt-2 max-w-4xl text-base leading-relaxed text-[#414B5A] sm:text-lg">
            Essential staples meticulously cut from Irish linen, organic combed denim, and refined crepe for effortless versatility.
          </p>
        </div>
        <div className="container mx-auto">
          <ProductGrid products={products} loading={loading} error={error} />
        </div>
      </div>
      <FeaturedCollection />
      <FeaturesSection />
    </div>
  );
};

export default Home;
