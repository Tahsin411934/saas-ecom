// ============================================================
// Auth Types - TypeScript interfaces for authentication
// ============================================================

export interface Permission {
  id: number;
  name: string;
  module: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface User {
  id: number;
  public_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: "active" | "inactive" | "suspended";
  email_verified_at: string | null;
  phone_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  roles: Role[];
}

// ============================================================
// API Response Types
// ============================================================

export interface AuthSuccessResponse {
  status: "success";
  message: string;
  user: User;
  token?: string | null;
  access_token?: string | null;
}

export interface UserResponse {
  status: "success";
  user: User;
}

export interface LogoutResponse {
  status: "success";
  message: string;
}

export interface MessageResponse {
  status: "success";
  message: string;
}

export interface ValidationError {
  status: "error";
  message: string;
  errors: Record<string, string[]>;
}

export interface GenericError {
  status: "error";
  message: string;
}

export type ApiError = ValidationError | GenericError;

// ============================================================
// Form State Types (for useActionState)
// ============================================================

export interface AuthFormState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  fieldValues?: Record<string, string>;
  user?: User;
  token?: string | null;
}

export interface PasswordFormState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export interface ForgotPasswordFormState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================================
// Request Types
// ============================================================

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  role_id?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}