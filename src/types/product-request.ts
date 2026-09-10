export interface ProductRequestPayload {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  product_name: string;
  product_description?: string;
  product_image?: File;
  quantity?: number;
  expected_price?: number;
  notes?: string;
}

export interface ProductRequestResponse {
  status: string;
  message: string;
}