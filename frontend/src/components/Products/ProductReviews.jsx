import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const API_URL = import.meta.env.VITE_BACKEND_URL || "";

const formatDate = (date) =>
  new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));

const RatingStars = ({ rating, interactive = false, onChange, label }) => (
  <div role="group" className="flex items-center gap-1" aria-label={label || `${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) =>
      interactive ? (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`Rate ${star} out of 5`}
          aria-pressed={rating === star}
          className="rounded-sm p-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#414b36]"
        >
          <FiStar
            aria-hidden="true"
            className={`h-5 w-5 ${star <= rating ? "fill-[#b7792b] text-[#b7792b]" : "text-[#c9c4ba]"}`}
          />
        </button>
      ) : (
        <FiStar
          key={star}
          aria-hidden="true"
          className={`h-4 w-4 ${star <= rating ? "fill-[#b7792b] text-[#b7792b]" : "text-[#d8d2c8]"}`}
        />
      )
    )}
  </div>
);

const ProductReviews = ({ productId }) => {
  const { user } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ rating: 0, numReviews: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [reviewState, setReviewState] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadReviews = useCallback(async (requestedPage = page) => {
    const { data } = await axios.get(
      `${API_URL}/api/reviews/products/${productId}?page=${requestedPage}`
    );
    setReviews(data.reviews);
    setSummary({
      rating: data.rating,
      numReviews: data.numReviews,
      totalPages: data.totalPages,
    });
  }, [page, productId]);

  const loadReviewState = useCallback(async () => {
    if (!user) {
      setReviewState(null);
      setRating(0);
      setComment("");
      return;
    }

    const { data } = await axios.get(
      `${API_URL}/api/reviews/products/${productId}/mine`
    );
    setReviewState(data);
    setRating(data.review?.rating ?? 0);
    setComment(data.review?.comment ?? "");
  }, [productId, user]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    Promise.all([
      axios.get(`${API_URL}/api/reviews/products/${productId}?page=${page}`),
      user
        ? axios.get(`${API_URL}/api/reviews/products/${productId}/mine`)
        : Promise.resolve(null),
    ])
      .then(([reviewsResponse, reviewStateResponse]) => {
        if (!active) return;
        const data = reviewsResponse.data;
        setReviews(data.reviews);
        setSummary({
          rating: data.rating,
          numReviews: data.numReviews,
          totalPages: data.totalPages,
        });
        if (reviewStateResponse) {
          setReviewState(reviewStateResponse.data);
          setRating(reviewStateResponse.data.review?.rating ?? 0);
          setComment(reviewStateResponse.data.review?.comment ?? "");
        } else {
          setReviewState(null);
          setRating(0);
          setComment("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message || "Unable to load product reviews."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, productId, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedComment = comment.trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("Choose a rating from 1 to 5 stars.");
      return;
    }
    if (!trimmedComment || trimmedComment.length > 2000) {
      setError("Enter a comment of 1 to 2000 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (reviewState?.review?._id) {
        await axios.put(
          `${API_URL}/api/reviews/${reviewState.review._id}`,
          { rating, comment: trimmedComment }
        );
        setSuccess("Your review has been updated.");
      } else {
        await axios.post(
          `${API_URL}/api/reviews/products/${productId}`,
          { rating, comment: trimmedComment }
        );
        setSuccess("Thank you for sharing your review.");
      }
      await Promise.all([loadReviews(), loadReviewState()]);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to save your review. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const changePage = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: document.getElementById("product-reviews")?.offsetTop ?? 0, behavior: "smooth" });
  };

  return (
    <section
      id="product-reviews"
      aria-labelledby="product-reviews-title"
      className="mx-auto mt-12 max-w-7xl border-t border-[#EAE6DF] pt-9 sm:mt-16 sm:pt-12"
    >
      <header className="flex flex-col gap-5 border-b border-[#EAE6DF] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="luxury-eyebrow mb-2 text-[#77746D]">Customer feedback</p>
          <h2 id="product-reviews-title" className="text-3xl text-[#171714] sm:text-4xl">
            Reviews
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-medium text-[#171714]">
            {Number(summary.rating).toFixed(1)}
          </span>
          <div>
            <RatingStars rating={Math.round(summary.rating)} />
            <p className="mt-1 text-xs text-[#77746D]">
              {summary.numReviews} {summary.numReviews === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-8 py-7 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.65fr)] lg:gap-12">
        <div className="order-2 space-y-5 lg:order-1">
          {loading ? (
            <p role="status" className="py-6 text-sm text-[#77746D]">Loading reviews…</p>
          ) : error && reviews.length === 0 ? (
            <p role="alert" className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </p>
          ) : reviews.length === 0 ? (
            <p className="border border-[#EAE6DF] bg-white p-5 text-sm text-[#77746D]">
              No reviews yet. Be the first eligible customer to share your experience.
            </p>
          ) : (
            reviews.map((review) => (
              <article key={review._id} className="border-b border-[#EAE6DF] pb-5 last:border-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#292b25]">{review.reviewerName}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <RatingStars rating={review.rating} />
                      {review.verifiedPurchase && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#59634c]">
                          Verified purchase
                        </span>
                      )}
                    </div>
                  </div>
                  <time dateTime={review.createdAt} className="text-xs text-[#85847c]">
                    {formatDate(review.createdAt)}
                  </time>
                </div>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#5C5A54]">
                  {review.comment}
                </p>
              </article>
            ))
          )}

          {summary.totalPages > 1 && (
            <nav aria-label="Review pages" className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => changePage(page - 1)}
                disabled={page <= 1 || loading}
                className="border border-[#D8D2C8] px-4 py-2 text-xs font-semibold text-[#414B36] disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-[#77746D]">
                Page {page} of {summary.totalPages}
              </span>
              <button
                type="button"
                onClick={() => changePage(page + 1)}
                disabled={page >= summary.totalPages || loading}
                className="border border-[#D8D2C8] px-4 py-2 text-xs font-semibold text-[#414B36] disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          )}
        </div>

        <aside className="order-1 h-fit border border-[#EAE6DF] bg-white p-5 sm:p-6 lg:order-2">
          <h3 className="text-xl text-[#171714]">
            {reviewState?.review ? "Edit your review" : "Write a review"}
          </h3>
          {!user ? (
            <p className="mt-3 text-sm leading-6 text-[#77746D]">
              <Link to="/login" className="font-semibold text-[#414B36] underline">
                Sign in
              </Link>{" "}
              to check your purchase eligibility and write a review.
            </p>
          ) : (reviewState?.review && reviewState?.eligible) || reviewState?.canReview ? (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <fieldset>
                <legend className="mb-2 text-xs font-semibold text-[#55564f]">Your rating</legend>
                <RatingStars
                  rating={rating}
                  interactive
                  onChange={setRating}
                  label="Choose a rating from 1 to 5 stars"
                />
              </fieldset>
              <div>
                <label htmlFor="product-review-comment" className="mb-2 block text-xs font-semibold text-[#55564f]">
                  Your comment
                </label>
                <textarea
                  id="product-review-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={5}
                  maxLength={2000}
                  required
                  placeholder="Share your experience with this product"
                  className="w-full resize-y border border-[#dedbd3] bg-[#fcfbf9] px-3 py-2.5 text-sm text-[#292b25] outline-none focus:border-[#68725b] focus:ring-2 focus:ring-[#414b36]/10"
                />
                <p className="mt-1 text-right text-[10px] text-[#85847c]">
                  {comment.length}/2000
                </p>
              </div>
              {error && <p role="alert" className="text-sm text-[#A94F38]">{error}</p>}
              {success && <p role="status" className="text-sm text-[#59634c]">{success}</p>}
              <button
                type="submit"
                disabled={saving}
                className="luxury-button w-full rounded-sm disabled:opacity-60"
              >
                {saving ? "Saving…" : reviewState?.review ? "Update review" : "Submit review"}
              </button>
            </form>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[#77746D]">
              {reviewState?.message || "Checking whether you can review this product…"}
            </p>
          )}
          {user && error && !reviewState?.canReview && !reviewState?.review && (
            <p role="alert" className="mt-3 text-sm text-[#A94F38]">{error}</p>
          )}
        </aside>
      </div>
    </section>
  );
};

export default ProductReviews;
