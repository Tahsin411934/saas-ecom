"use server";

import { buildApiUrl } from "@/lib/api-url";

export type PartnerFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  storeName?: string;
};

export async function registerPartner(
  _previousState: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  const read = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  // This action is intentionally public. Only registration fields reach the API.
  const payload = {
    store_name: read("store_name").trim(),
    first_name: read("first_name").trim(),
    last_name: read("last_name").trim(),
    email: read("email").trim(),
    phone: read("phone").trim() || null,
    password: read("password"),
    password_confirmation: read("password_confirmation"),
    currency_code: "BDT",
    timezone: "Asia/Dhaka",
  };

  const errors: Record<string, string[]> = {};
  for (const field of ["store_name", "first_name", "last_name", "email", "password"] as const) {
    if (!payload[field]) errors[field] = ["This field is required."];
  }
  if (payload.password && payload.password.length < 8) {
    errors.password = ["Use at least 8 characters for your password."];
  }
  if (payload.password !== payload.password_confirmation) {
    errors.password_confirmation = ["Your passwords do not match."];
  }
  if (Object.keys(errors).length) {
    return { success: false, message: "Please check the highlighted fields.", errors };
  }

  try {
    const response = await fetch(buildApiUrl("/api/v1/register/store-owner"), {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    const result = await response.json().catch(() => null);

    if (response.status === 422) {
      const fieldErrors: Record<string, string[]> = {};
      if (result?.errors && typeof result.errors === "object") {
        for (const [field, messages] of Object.entries(result.errors)) {
          if (Array.isArray(messages)) {
            fieldErrors[field] = messages.filter((message): message is string => typeof message === "string");
          }
        }
      }
      return { success: false, message: "Please check the highlighted fields.", errors: fieldErrors };
    }
    if (response.status === 429) {
      return { success: false, message: "Too many attempts. Please wait a moment before trying again." };
    }
    if (!response.ok || result?.status !== "success" || !result?.data?.store) {
      return { success: false, message: "We couldn’t complete your registration. Please try again shortly." };
    }

    // Do not expose the backend token or replace an existing shopper session.
    return {
      success: true,
      message: "Your partner account has been created.",
      storeName: typeof result.data.store.name === "string" ? result.data.store.name : payload.store_name,
    };
  } catch {
    return {
      success: false,
      message: "We couldn’t confirm your registration. Check your connection. If you already submitted, try signing in before submitting again.",
    };
  }
}
