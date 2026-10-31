import { api, normalizeApiList, normalizeApiData, type ApiEnvelope } from "@/lib/api";
import type { ReviewResponse, Review } from "@/types/review";

export const reviewService = {
  /**
   * Get reviews for a product
   */
  async getProductReviews(productId: number): Promise<ReviewResponse> {
    // Raw payload: { status, message, data: { items: Review[] } } — normalize.
    const res = await api<ApiEnvelope<Review>>(`/products/${productId}/reviews`, {
      revalidate: 60,
    });
    return normalizeApiList<Review>(res);
  },

  /**
   * Submit a new review
   */
  async submitReview(productId: number, reviewData: {
    rating: number;
    title: string;
    body: string;
  }): Promise<ReviewResponse> {
    const response = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(reviewData),
    });
    const res = await response.json();
    if (!response.ok) throw new Error(res.message || "Unable to submit review.");
    // Only the success flag matters to the caller — map status → success.
    return normalizeApiData<Review[]>(res, []);
  },
};