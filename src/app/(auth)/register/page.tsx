"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { registerUser } from "@/app/actions/auth";
import type { AuthFormState } from "@/lib/features/auth/auth.types";
import { trackSignUp } from "@/lib/gtm";

const initialState: AuthFormState = {
  success: false,
  message: "",
};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerUser, initialState);

  useEffect(() => {
    if (state.message && !state.success) {
      toast.error(state.message, { toastId: "register-error" });
    } else if (state.success) {
      // GTM: Track sign up
      trackSignUp({ method: "email" });
      toast.success(state.message, { toastId: "register-success" });
    }
  }, [state.message, state.success]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-[var(--color-primary)]">OneHaatbd</h1>
          </Link>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">Join OneHaatbd and start shopping</p>
        </div>

        <form action={formAction} className="mt-8 space-y-5 bg-white p-8 rounded-xl shadow-sm border border-gray-100" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">First name</label>
              <input id="first_name" name="first_name" type="text" required
                defaultValue={state.fieldValues?.first_name || ""}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)]" />
              {state.errors?.first_name && <p className="mt-1 text-sm text-red-600">{state.errors.first_name[0]}</p>}
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
              <input id="last_name" name="last_name" type="text" required
                defaultValue={state.fieldValues?.last_name || ""}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)]" />
              {state.errors?.last_name && <p className="mt-1 text-sm text-red-600">{state.errors.last_name[0]}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="email" name="email" type="email" required
              defaultValue={state.fieldValues?.email || ""}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)]" />
            {state.errors?.email && <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-gray-400">(optional)</span></label>
            <input id="phone" name="phone" type="tel"
              defaultValue={state.fieldValues?.phone || ""}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)]" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input id="password" name="password" type="password" required
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)]" />
            {state.errors?.password && <p className="mt-1 text-sm text-red-600">{state.errors.password[0]}</p>}
          </div>

          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input id="password_confirmation" name="password_confirmation" type="password" required
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)]" />
          </div>

          <button type="submit" disabled={pending}
            className="w-full py-2.5 px-4 bg-[var(--color-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-primary)] disabled:opacity-50">
            {pending ? "Creating account..." : "Create account"}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">Already have an account?{" "}
              <Link href="/login" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)]">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}