"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type {
  AuthFormState,
  PasswordFormState,
  ForgotPasswordFormState,
} from "@/lib/features/auth/auth.types";
import { buildApiUrl } from "@/lib/api-url";

const TOKEN_COOKIE_NAME = "token";

interface ApiError {
  status?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

async function apiRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string>),
    },
    cache: "no-store",
  });

  const raw = await response.json().catch(() => ({ message: "Invalid response from server" }));

  if (!response.ok) {
    const error = new Error((raw as ApiError).message || "Authentication request failed") as Error & {
      status?: number;
      errors?: Record<string, string[]>;
    };
    error.status = response.status;
    error.errors = (raw as ApiError).errors;
    throw error;
  }

  // The backend wraps every payload in a `{ status, message, data }` envelope
  // (see backend app/Helpers/ApiResponse.php and frontend src/lib/api.ts).
  // Unwrap object payloads so callers can read `token` / `user` directly.
  // Message-only responses (payload is null) are returned as-is.
  const envelope = raw as { data?: unknown };
  const payload =
    envelope !== null &&
    typeof envelope === "object" &&
    "data" in envelope &&
    envelope.data !== null &&
    typeof envelope.data === "object"
      ? envelope.data
      : raw;

  return payload as T;
}

async function setTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

async function deleteTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
}

function isRedirectError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const e = error as any;
  if (e?.digest === "NEXT_REDIRECT") return true;
  if (e?.code === "NEXT_REDIRECT") return true;
  if (e?.name === "Redirect" || e?.name === "RedirectError") return true;
  if (typeof e?.message === "string" && e.message.includes("NEXT_REDIRECT")) return true;
  return false;
}

export async function registerUser(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  try {
    const data = await apiRequest<{ status: string; message: string; user?: any; token?: string; access_token?: string }>("/api/register", {
      method: "POST",
      body: JSON.stringify({
        first_name: formData.get("first_name"),
        last_name: formData.get("last_name"),
        email: formData.get("email"),
        phone: formData.get("phone") || undefined,
        password: formData.get("password"),
        password_confirmation: formData.get("password_confirmation"),
      }),
    });

    const token = data.token ?? data.access_token ?? null;
    if (token) {
      await setTokenCookie(token);
    }

    redirect("/dashboard");
    return {
      success: true,
      message: data.message || "Registration successful.",
      user: data.user,
      token,
    };
  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      success: false,
      message: error.message || "Registration failed.",
      errors: error.errors,
      fieldValues: {
        first_name: (formData.get("first_name") as string) || "",
        last_name: (formData.get("last_name") as string) || "",
        email: (formData.get("email") as string) || "",
        phone: (formData.get("phone") as string) || "",
      },
    };
  }
}

export async function loginAction(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  try {
    const data = await apiRequest<{ status: string; message: string; user?: any; token?: string; access_token?: string }>('/login', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });

    const token = data.token ?? data.access_token ?? null;
    if (!token) {
      throw new Error('Authentication token was not returned by the server.');
    }

    await setTokenCookie(token);

    return {
      success: true,
      message: data.message || 'Login successful.',
      user: data.user,
      token,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Login failed.',
      errors: error.errors,
      fieldValues: {
        email: (formData.get('email') as string) || '',
      },
    };
  }
}

export const loginUser = loginAction;

export async function forgotPasswordAction(
  prevState: ForgotPasswordFormState,
  formData: FormData
): Promise<ForgotPasswordFormState> {
  try {
    const data = await apiRequest<{ status: string; message: string }>('/api/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: formData.get('email') }),
    });
    return { success: true, message: data.message || 'Reset link sent.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed.', errors: error.errors };
  }
}

export async function resetPasswordAction(
  prevState: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  try {
    const data = await apiRequest<{ status: string; message: string }>('/api/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.get('email'),
        token: formData.get('token'),
        password: formData.get('password'),
        password_confirmation: formData.get('password_confirmation'),
      }),
    });
    return { success: true, message: data.message || 'Password reset successful.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed.', errors: error.errors };
  }
}

export async function logoutUserAction(): Promise<{ success: boolean; message: string }> {
  try {
    const token = (await cookies()).get(TOKEN_COOKIE_NAME)?.value;
    if (token) {
      await apiRequest<{ status: string; message: string }>('/api/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch {
    // ignore logout errors
  } finally {
    await deleteTokenCookie();
  }

  return { success: true, message: 'Logged out.' };
}

export async function logoutAllDevicesAction(): Promise<{ success: boolean; message: string }> {
  try {
    const token = (await cookies()).get(TOKEN_COOKIE_NAME)?.value;
    if (token) {
      await apiRequest<{ status: string; message: string }>('/api/logout-all', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch {
    // ignore logout errors
  } finally {
    await deleteTokenCookie();
  }

  return { success: true, message: 'Logged out from all devices.' };
}

export async function logoutAction() {
  try {
    const token = (await cookies()).get(TOKEN_COOKIE_NAME)?.value;
    if (token) {
      await apiRequest<{ status: string; message: string }>('/api/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch {
    // ignore logout errors
  } finally {
    await deleteTokenCookie();
    redirect('/login');
  }
}

export async function changePasswordAction(
  prevState: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  try {
    const data = await apiRequest<{ status: string; message: string }>('/api/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: formData.get('current_password'),
        password: formData.get('password'),
        password_confirmation: formData.get('password_confirmation'),
      }),
    });
    return { success: true, message: data.message || 'Password changed.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed.', errors: error.errors };
  }
}

export async function getAuthenticatedUserAction(): Promise<{
  success: boolean;
  user?: any;
  message?: string;
}> {
  try {
    const token = (await cookies()).get(TOKEN_COOKIE_NAME)?.value;
    const data = await apiRequest<{ status: string; user?: any }>('/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token || ''}`,
      },
    });
    return { success: true, user: data.user };
  } catch {
    return { success: false, message: 'Not authenticated.' };
  }
}
