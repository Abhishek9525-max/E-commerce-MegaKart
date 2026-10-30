import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FiStar, FiTrash2 } from "react-icons/fi";

const API_URL = import.meta.env.VITE_BACKEND_URL || "";

const ProductReviewsPanel = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadReviews = useCallback(async (requestedPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(
        `${API_URL}/api/admin/reviews/products/${productId}?page=${requestedPage}`
      );
      setReviews(data.reviews);
      setPage(data.page);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load product reviews.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadReviews(1);
  }, [productId, loadReviews]);

  const confirmDelete = async () => {
    if (!reviewToDelete || deleting) return;
    setDeleting(true);
    setError("");
    try {
      await axios.delete(
        `${API_URL}/api/admin/reviews/products/${productId}/${reviewToDelete._id}`
      );
      setReviewToDelete(null);
      await loadReviews(page > 1 && reviews.length === 1 ? page - 1 : page);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete review.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="space-y-5 border border-[#e7e4dc] bg-white p-5 shadow-[0_8px_24px_rgba(39,46,32,0.035)] sm:p-8">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[#eeece6] pb-4">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#85847c]">
            Product feedback
          </p>
          <h2 className="text-2xl font-medium text-[#292b25]">Reviews</h2>
        </div>
        <span className="text-xs text-[#77766e]">
          {total} {total === 1 ? "review" : "reviews"}
        </span>
      </header>

      {error && <p role="alert" className="border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {loading ? (
        <p role="status" className="py-5 text-sm text-[#77766e]">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="py-5 text-sm text-[#77766e]">This product has no reviews yet.</p>
      ) : (
        <div className="divide-y divide-[#eeece6]">
          {reviews.map((review) => (
            <article key={review._id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="text-sm font-semibold text-[#292b25]">{review.reviewerName}</h3>
                  <span className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        aria-hidden="true"
                        className={`h-3.5 w-3.5 ${star <= review.rating ? "fill-[#b7792b] text-[#b7792b]" : "text-[#d8d2c8]"}`}
                      />
                    ))}
                  </span>
                  <time dateTime={review.createdAt} className="text-xs text-[#85847c]">
                    {new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(new Date(review.createdAt))}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#5C5A54]">
                  {review.comment}
                </p>
                <span className={`mt-2 inline-flex text-[10px] font-semibold uppercase tracking-wide ${review.verifiedPurchase ? "text-[#59634c]" : "text-[#a94f38]"}`}>
                  {review.verifiedPurchase ? "Verified purchase" : "Unverified purchase"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReviewToDelete(review)}
                aria-label={`Delete review by ${review.reviewerName}`}
                className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 self-start border border-[#ead0ca] px-3 py-2 text-xs font-semibold text-[#a94f38] transition-colors hover:bg-rose-50"
              >
                <FiTrash2 aria-hidden="true" />
                Delete
              </button>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Admin review pages" className="flex items-center justify-between border-t border-[#eeece6] pt-4">
          <button type="button" onClick={() => loadReviews(page - 1)} disabled={page <= 1 || loading} className="border border-[#dedbd3] px-3 py-2 text-xs font-semibold text-[#59634c] disabled:opacity-50">
            Previous
          </button>
          <span className="text-xs text-[#77766e]">Page {page} of {totalPages}</span>
          <button type="button" onClick={() => loadReviews(page + 1)} disabled={page >= totalPages || loading} className="border border-[#dedbd3] px-3 py-2 text-xs font-semibold text-[#59634c] disabled:opacity-50">
            Next
          </button>
        </nav>
      )}

      {reviewToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-[#171714]/45 p-4 backdrop-blur-[2px]">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-review-title"
            aria-describedby="delete-review-description"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto border border-[#e7e4dc] bg-white p-5 shadow-[0_24px_70px_rgba(23,23,20,0.2)] sm:p-6"
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a94f38]">Confirm moderation</p>
            <h3 id="delete-review-title" className="text-xl font-medium text-[#292b25]">Delete this review?</h3>
            <p id="delete-review-description" className="mt-2 text-sm leading-6 text-[#77766e]">
              This review by {reviewToDelete.reviewerName} will be permanently removed.
            </p>
            {error && <p role="alert" className="mt-4 text-sm text-[#a94f38]">{error}</p>}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setReviewToDelete(null)} disabled={deleting} className="min-h-11 border border-[#dedbd3] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#55564f] disabled:opacity-60">
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} disabled={deleting} className="min-h-11 bg-[#a94f38] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-60">
                {deleting ? "Deleting…" : "Delete review"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
};

export default ProductReviewsPanel;
