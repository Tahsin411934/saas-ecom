import type { ProductRequestPayload, ProductRequestResponse } from "@/types/product-request";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://admin.onehaatbd.com/api/v1";

export async function submitProductRequest(
  data: ProductRequestPayload
): Promise<ProductRequestResponse> {
  const formData = new FormData();
  formData.append("customer_name", data.customer_name);
  formData.append("customer_email", data.customer_email);
  if (data.customer_phone) formData.append("customer_phone", data.customer_phone);
  formData.append("product_name", data.product_name);
  if (data.product_description) formData.append("product_description", data.product_description);
  if (data.product_image) formData.append("product_image", data.product_image);
  if (data.quantity) formData.append("quantity", String(data.quantity));
  if (data.expected_price) formData.append("expected_price", String(data.expected_price));
  if (data.notes) formData.append("notes", data.notes);

  const response = await fetch(`${API_BASE_URL}/product-requests`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to submit request");
  }

  return result;
}