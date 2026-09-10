/**
 * Common/shared API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiPaginatedResponse<T> extends ApiResponse<T> {
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}