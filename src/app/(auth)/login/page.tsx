"use client";

import { useActionState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { loginUser } from "@/app/actions/auth";
import type { AuthFormState } from "@/lib/features/auth/auth.types";
import { trackLogin } from "@/lib/gtm";
import { useAppDispatch } from "@/lib/hooks";
import { setUser } from "@/lib/features/auth/authSlice";

const initialState: AuthFormState = {
  success: false,
  message: "",
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [state, formAction, pending] = useActionState(loginUser, initialState);
  const dispatch = useAppDispatch();

  // Show toast on success/error, then redirect on success
  useEffect(() => {
    if (state.success) {
      // The server action already returns the logged-in user — sync it into
      // Redux right away so the navbar flips to the logged-in menu
      // (Profile / Orders / Dashboard) without waiting for the redirect.
      if (state.user) dispatch(setUser(state.user));
      // GTM: Track login
      trackLogin({ method: "email" });
      toast.success(state.message || "Login successful!");
      setTimeout(() => router.push(redirectTo), 1000);
    } else if (state.message) {
      toast.error(state.message, { toastId: "login-error" });
    }
  }, [state.success, state.message, state.user, dispatch, router, redirectTo]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-[var(--color-primary)]">OneHaatbd</h1>
          </Link>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        <form action={formAction} className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100" noValidate>
          <input type="hidden" name="redirect" value={redirectTo} />

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required
              defaultValue={state.fieldValues?.email || ""}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)]" />
            {state.errors?.email && <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)]" />
            {state.errors?.password && <p className="mt-1 text-sm text-red-600">{state.errors.password[0]}</p>}
          </div>

          <div className="flex items-center justify-end">
            <Link href="/forgot-password" className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)]">Forgot password?</Link>
          </div>

          <button type="submit" disabled={pending}
            className="w-full py-2.5 px-4 bg-[var(--color-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-primary)] disabled:opacity-50">
            {pending ? "Signing in..." : "Sign in"}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">Don't have an account?{" "}
              <Link href="/register" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)]">Create one</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}