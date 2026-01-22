import api from './api';

// Types based on backend Review model
export interface Review {
  _id: string;
  userId: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  unhelpfulCount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: File[];
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[]; // URLs to keep
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export const reviewService = {
  // Get reviews for a product
  async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful' = 'newest'
  ): Promise<{
    reviews: Review[];
    total: number;
    pages: number;
  }> {
    const response = await api.get(
      `/reviews/product/${productId}?page=${page}&limit=${limit}&sortBy=${sortBy}`
    );
    return response.data;
  },

  // Get review statistics for a product
  async getProductReviewStats(productId: string): Promise<ReviewStats> {
    const response = await api.get(`/reviews/product/${productId}/stats`);
    return response.data;
  },

  // Get reviews by user
  async getUserReviews(page: number = 1, limit: number = 10): Promise<{
    reviews: Review[];
    total: number;
    pages: number;
  }> {
    const response = await api.get(`/reviews/user?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get single review
  async getReview(reviewId: string): Promise<Review> {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data;
  },

  // Create a review
  async createReview(data: CreateReviewData): Promise<Review> {
    const formData = new FormData();
    formData.append('productId', data.productId);
    formData.append('rating', data.rating.toString());
    if (data.title) formData.append('title', data.title);
    formData.append('comment', data.comment);
    if (data.images) {
      data.images.forEach((file) => formData.append('images', file));
    }

    const response = await api.post('/reviews', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update a review
  async updateReview(reviewId: string, data: UpdateReviewData): Promise<Review> {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data;
  },

  // Delete a review
  async deleteReview(reviewId: string): Promise<{ message: string }> {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Mark review as helpful
  async markHelpful(reviewId: string): Promise<{ helpfulCount: number; message: string }> {
    const response = await api.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  },

  // Mark review as unhelpful
  async markUnhelpful(reviewId: string): Promise<{ unhelpfulCount: number; message: string }> {
    const response = await api.post(`/reviews/${reviewId}/unhelpful`);
    return response.data;
  },

  // Remove helpful/unhelpful vote
  async removeVote(reviewId: string): Promise<{ message: string }> {
    const response = await api.delete(`/reviews/${reviewId}/vote`);
    return response.data;
  },

  // Report a review
  async reportReview(reviewId: string, reason: string): Promise<{ message: string }> {
    const response = await api.post(`/reviews/${reviewId}/report`, { reason });
    return response.data;
  },

  // Get user's review for a specific product
  async getUserProductReview(productId: string): Promise<Review | null> {
    const response = await api.get(`/reviews/user/product/${productId}`);
    return response.data;
  },

  // Check if user can review a product (purchased and not already reviewed)
  async canReview(productId: string): Promise<{ canReview: boolean; reason?: string }> {
    const response = await api.get(`/reviews/can-review/${productId}`);
    return response.data;
  },

  // Get reviews pending moderation (admin)
  async getPendingReviews(page: number = 1, limit: number = 10): Promise<{
    reviews: Review[];
    total: number;
    pages: number;
  }> {
    const response = await api.get(`/reviews/admin/pending?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Approve a review (admin)
  async approveReview(reviewId: string): Promise<Review> {
    const response = await api.patch(`/reviews/admin/${reviewId}/approve`);
    return response.data;
  },

  // Reject a review (admin)
  async rejectReview(reviewId: string, reason?: string): Promise<Review> {
    const response = await api.patch(`/reviews/admin/${reviewId}/reject`, { reason });
    return response.data;
  },
};

export default reviewService;

