"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import AuthGuard, { useAuth } from "@/components/auth/AuthGuard";
import { logoutUserAction, logoutAllDevicesAction } from "@/app/actions/auth";

function ProfileContent() {
  const { user } = useAuth();
  const router = useRouter();

  const [logoutState, logoutAction, logoutPending] = useActionState(
    async () => {
      const result = await logoutUserAction();
      if (result.success) {
        toast.success("Logged out successfully");
        router.push("/login");
      }
      return result;
    },
    { success: false, message: "" }
  );

  const [logoutAllState, logoutAllAction, logoutAllPending] = useActionState(
    async () => {
      const result = await logoutAllDevicesAction();
      if (result.success) {
        toast.success("Logged out from all devices");
        router.push("/login");
      }
      return result;
    },
    { success: false, message: "" }
  );

  if (!user) return null;

  const fullName = `${user.first_name} ${user.last_name}`;
  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
  const roleNames = user.roles?.map((r) => r.name).join(", ") || "Customer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-[var(--color-primary)] tracking-tight">
              OneHaatbd<span className="text-gray-400">.</span>
            </h1>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Banner & Avatar */}
          <div className="relative h-32 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] opacity-90" />
          <div className="relative px-6 pb-6">
            <div className="flex items-end -mt-12 mb-4">
              <div className="flex items-center justify-center h-20 w-20 rounded-xl bg-white shadow-md text-2xl font-bold text-[var(--color-primary)] border border-gray-100">
                {initials}
              </div>
              <div className="ml-4 pb-1">
                <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <span className={`ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.status === "active"
                  ? "bg-green-100 text-green-800"
                  : user.status === "suspended"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
              }`}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-5">
              <InfoItem label="First Name" value={user.first_name} />
              <InfoItem label="Last Name" value={user.last_name} />
              <InfoItem label="Email" value={user.email} />
              {user.phone && <InfoItem label="Phone" value={user.phone} />}
              <InfoItem label="Role" value={roleNames} />
              {user.last_login_at && (
                <InfoItem label="Last Login" value={new Date(user.last_login_at).toLocaleString()} />
              )}
              <InfoItem label="Member Since" value={new Date(user.created_at).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric"
              })} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <Link
            href="/change-password"
            className="flex items-center justify-center w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Change Password
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              disabled={logoutPending}
              className="flex items-center justify-center w-full px-4 py-2.5 border border-red-200 rounded-xl text-sm font-semibold text-red-600 bg-white hover:bg-red-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {logoutPending ? (
                <Spinner className="text-red-600" label="Logging out..." />
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </>
              )}
            </button>
          </form>

          <form action={logoutAllAction}>
            <button
              type="submit"
              disabled={logoutAllPending}
              className="flex items-center justify-center w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {logoutAllPending ? (
                <Spinner className="text-gray-500" label="Logging out all devices..." />
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Sign Out from All Devices
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span className="inline-flex items-center">
      <svg className={`animate-spin -ml-1 mr-2 h-4 w-4 ${className || "text-gray-400"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      {label && <span>{label}</span>}
    </span>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}