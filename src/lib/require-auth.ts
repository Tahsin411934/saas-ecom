/**
 * Check if user is authenticated.
 * If not, redirect to login page preserving the current URL.
 * Returns true if authenticated, false otherwise.
 */
export function requireAuth(isAuthenticated?: boolean): boolean {
  if (typeof window === "undefined") return false;

  // If auth state is provided and user is authenticated, allow
  if (isAuthenticated === true) return true;

  // Not logged in — redirect to login
  const currentPath = window.location.pathname + window.location.search;
  window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
  return false;
}
