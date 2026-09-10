import Link from "next/link";
import { getAuthenticatedUserAction } from "@/app/actions/auth";

export default async function DashboardPage() {
  const authResponse = await getAuthenticatedUserAction();
  const user = authResponse.success ? authResponse.user ?? null : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-primary)]">Dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold text-gray-900">Welcome back</h1>
            <p className="mt-2 text-sm text-gray-600">
              {user ? `${user.first_name} ${user.last_name}` : "You are signed in."}
            </p>
          </div>
          <Link href="/profile" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            View profile
          </Link>
        </div>
      </div>
    </div>
  );
}
