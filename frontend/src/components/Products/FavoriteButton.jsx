import React, { useEffect } from "react";
import { HiHeart, HiOutlineHeart } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  clearFavorites,
  fetchFavorites,
  toggleFavorite,
} from "../../redux/slices/favoriteSlice";

const FavoriteButton = ({ product, className = "" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { productIds, pendingProductIds, status } = useSelector(
    (state) => state.favorites
  );
  const isFavorite = productIds.includes(product._id);
  const isPending =
    status === "loading" || pendingProductIds.includes(product._id);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchFavorites(user._id));
    } else {
      dispatch(clearFavorites());
    }
  }, [dispatch, user?._id]);

  const handleClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast.info("Sign in to save your favorites.");
      navigate("/login");
      return;
    }
    if (isPending) return;

    try {
      await dispatch(toggleFavorite({ product, isFavorite })).unwrap();
      toast.success(isFavorite ? "Removed from favorites." : "Added to favorites.");
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={
        isFavorite
          ? `Remove ${product.name} from favorites`
          : `Add ${product.name} to favorites`
      }
      aria-pressed={isFavorite}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#414B36] shadow-sm transition-colors hover:bg-white hover:text-[#A94F38] disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      {isFavorite ? (
        <HiHeart aria-hidden="true" className="h-5 w-5 text-[#A94F38]" />
      ) : (
        <HiOutlineHeart aria-hidden="true" className="h-5 w-5" />
      )}
    </button>
  );
};

export default FavoriteButton;
