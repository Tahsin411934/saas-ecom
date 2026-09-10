export interface Review {
  id: number;
  user_name: string;
  rating: number;
  title: string;
  body: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface ReviewResponse {
  success: boolean;
  message?: string;
  data: Review[];
  average_rating?: number;
  total_reviews?: number;
}