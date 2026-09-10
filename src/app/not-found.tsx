import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | OneHaatbd",
  description: "The page you are looking for does not exist or has been moved.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <h1 className="mb-4 text-8xl font-bold text-[var(--color-primary)]">404</h1>
        <h2 className="mb-2 text-2xl font-semibold text-gray-800">
          Page not found
        </h2>
        <p className="mb-8 text-gray-500">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--color-primary)] px-7 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[var(--color-primary)]"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}