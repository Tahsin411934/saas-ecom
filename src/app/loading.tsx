import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[100vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm font-medium text-gray-500">Loading...</p>
      </div>
    </div>
  );
}
