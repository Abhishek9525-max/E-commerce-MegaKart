import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ProductGrid from "../components/Products/ProductGrid";
import { fetchFavorites } from "../redux/slices/favoriteSlice";

const FavoritesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { products, status, error } = useSelector((state) => state.favorites);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    dispatch(fetchFavorites(user._id));
  }, [dispatch, navigate, user]);

  if (!user) return null;

  return (
    <section className="min-h-screen bg-[#F5F2ED] px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-8 border-b border-[#D8D2C8] pb-5">
          <p className="luxury-eyebrow mb-2 text-[#A94F38]">Your MegaKart edit</p>
          <h1 className="text-4xl text-[#171714] sm:text-5xl">My Favorites</h1>
          <p className="mt-2 text-sm text-[#77746D]">
            Pieces you have saved for later.
          </p>
        </header>
        {status === "failed" ? (
          <p role="alert" className="text-sm text-[#A94F38]">
            Unable to load your favorites: {error}
          </p>
        ) : status === "loading" ? (
          <p className="text-sm text-[#77746D]" aria-live="polite">
            Loading favorites...
          </p>
        ) : products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <p className="text-sm text-[#77746D]">
            You have not saved any favorites yet.
          </p>
        )}
      </div>
    </section>
  );
};

export default FavoritesPage;
