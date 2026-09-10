"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <h1 className="mb-4 text-6xl font-bold text-[var(--color-primary)]">500</h1>
        <h2 className="mb-2 text-2xl font-semibold text-gray-800">
          Something went wrong
        </h2>
        <p className="mb-8 text-gray-500">
          We apologize for the inconvenience. Please try again later.
        </p>
        <button
          onClick={reset}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--color-primary)] px-7 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[var(--color-primary)]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}