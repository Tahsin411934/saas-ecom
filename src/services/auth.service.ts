import type {
  AuthSuccessResponse,
  UserResponse,
  LogoutResponse,
  MessageResponse,
  RegisterRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from "@/lib/features/auth/auth.types";
import { buildApiUrl } from "@/lib/api-url";

async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(buildApiUrl(endpoint), {
    ...options,
    credentials: "include",
    headers,
  });

  const data = await response.json().catch(() => ({ message: "Invalid response from server" }));

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong") as Error & {
      status: number;
      errors?: Record<string, string[]>;
    };
    error.status = response.status;
    error.errors = data.errors;
    throw error;
  }

  return data as T;
}

export async function registerUser(data: RegisterRequest): Promise<AuthSuccessResponse> {
  return authFetch<AuthSuccessResponse>("/api/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: LoginRequest): Promise<AuthSuccessResponse> {
  return authFetch<AuthSuccessResponse>("/api/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<MessageResponse> {
  return authFetch<MessageResponse>("/api/forgot-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
  return authFetch<MessageResponse>("/api/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAuthenticatedUser(): Promise<UserResponse> {
  // Call internal Next.js API route which proxies to backend using server-side cookie
  const res = await fetch("/api/me", { method: "GET", credentials: "include" });
  const data = await res.json().catch(() => ({ message: "Invalid response" }));
  if (!res.ok) {
    const err = new Error(data.message || "Not authenticated") as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  return data as UserResponse;
}

export async function logoutUser(): Promise<LogoutResponse> {
  return authFetch<LogoutResponse>("/api/logout", { method: "POST" });
}

export async function logoutAllDevices(): Promise<LogoutResponse> {
  return authFetch<LogoutResponse>("/logout-all", { method: "POST" });
}

export async function changePassword(data: ChangePasswordRequest): Promise<MessageResponse> {
  return authFetch<MessageResponse>("/change-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function refreshToken(): Promise<MessageResponse> {
  return authFetch<MessageResponse>("/refresh", { method: "POST" });
}