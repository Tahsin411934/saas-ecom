// ============================================================
// Forgot Password Page
// Uses server action with useActionState for progressive enhancement.
// Sends password reset link to user's email.
// ============================================================

"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/actions/auth";
import type { ForgotPasswordFormState } from "@/lib/features/auth/auth.types";

const initialState: ForgotPasswordFormState = {
  success: false,
  message: "",
};

export default function ForgotPasswordPage() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialState
  );

  // Reset form on success
  if (state.success && formRef.current) {
    formRef.current.reset();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-[var(--color-primary)]">OneHaatbd</h1>
          </Link>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset
            your password.
          </p>
        </div>

        {/* Form */}
        <form
          ref={formRef}
          action={formAction}
          className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100"
          noValidate
        >
          {/* Status Message */}
          {state.message && (
            <div
              className={`rounded-lg border p-4 ${
                state.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex">
                {state.success ? (
                  <svg
                    className="h-5 w-5 text-green-400 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-red-400 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <p
                  className={`ml-3 text-sm ${
                    state.success ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {state.message}
                </p>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`block w-full rounded-lg border ${
                state.errors?.email
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              } px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 text-sm transition-colors`}
              placeholder="you@example.com"
            />
            {state.errors?.email && (
              <p className="mt-1.5 text-sm text-red-600" role="alert">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={pending || state.success}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {pending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </>
              ) : state.success ? (
                "Link sent"
              ) : (
                "Send reset link"
              )}
            </button>
          </div>

          {/* Back to Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
              >
                Back to login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}