"use server";

import { buildApiUrl } from "@/lib/api-url";

export type ProductRequestFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  fieldValues?: Record<string, string>;
};

export async function submitProductRequest(
  prevState: ProductRequestFormState,
  formData: FormData
): Promise<ProductRequestFormState> {
  try {
    const body = new FormData();
    body.append("customer_name", formData.get("customer_name") as string);
    body.append("customer_email", formData.get("customer_email") as string);
    body.append("customer_phone", (formData.get("customer_phone") as string) || "");
    body.append("product_name", formData.get("product_name") as string);
    body.append("product_description", (formData.get("product_description") as string) || "");
    body.append("quantity", (formData.get("quantity") as string) || "1");
    body.append("expected_price", (formData.get("expected_price") as string) || "");
    body.append("notes", (formData.get("notes") as string) || "");

    const imageFile = formData.get("product_image") as File | null;
    if (imageFile && imageFile.size > 0) {
      body.append("product_image", imageFile);
    }

    const response = await fetch(buildApiUrl("/api/v1/product-requests"), {
      method: "POST",
      body,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to submit product request.",
        errors: data.errors,
        fieldValues: {
          customer_name: formData.get("customer_name") as string,
          customer_email: formData.get("customer_email") as string,
          customer_phone: formData.get("customer_phone") as string,
          product_name: formData.get("product_name") as string,
          product_description: formData.get("product_description") as string,
          quantity: formData.get("quantity") as string,
          expected_price: formData.get("expected_price") as string,
          notes: formData.get("notes") as string,
        },
      };
    }

    return {
      success: true,
      message: "Your product request has been submitted successfully. We will review it shortly.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Something went wrong. Please try again.",
    };
  }
}