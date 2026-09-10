/**
 * Central ISR/SSR policy — one place to control how fresh our server data is.
 *
 * Caching is applied at the FETCH level only:
 *   api(endpoint, { revalidate: REVALIDATE.X })   // services layer
 *   fetch(url, { next: { revalidate: REVALIDATE.X } })
 *
 * IMPORTANT — do NOT add `export const revalidate = REVALIDATE.X` in page files.
 * Next.js's build-time segment-config analyzer only accepts inline literals
 * (e.g. `export const revalidate = 300`). Imported values like REVALIDATE.X
 * cannot be statically resolved by it, which fails the build with
 * "Invalid segment configuration export detected". Since every server render
 * already reads cookies (NavbarServer) making routes dynamic, freshness is
 * governed entirely by this fetch-level policy. Edit numbers HERE only.
 *
 * Rule:
 *   value > 0  -> data revalidated (ISR-style Data Cache) after that many seconds.
 *   value = 0 / omitted for dynamic endpoints -> cache: "no-store" (always fresh).
 */
export const REVALIDATE = {
  /** Homepage sections (products by category, hero, campaigns). */
  HOME_PAGE: 300, // 5 minutes
  /** Product detail page + product reviews. */
  PRODUCT: 60, // 1 minute
  /** Category product list + category info (nav scroll too). */
  CATEGORY: 120, // 2 minutes
  /** Campaign detail page + active campaign list on home. */
  CAMPAIGN: 300, // 5 minutes
  /** Subnav product list. */
  SUBNAVBAR: 120, // 2 minutes
  /** Homepage hero banners & announcement bar. */
  BANNER: 60, // 1 minute
  /** Announcement bar. */
  ANNOUNCEMENT: 60, // 1 minute
  /** Navigation bar items. */
  NAVBAR: 60, // 1 minute
  /** Site settings (footer, theme, GTM). */
  SETTINGS: 3600, // 1 hour
  /** Sitemap feed from backend (products-count / products chunk). */
  SITEMAP: 3600, // 1 hour — matches the /sitemap.xml ISR window
} as const;