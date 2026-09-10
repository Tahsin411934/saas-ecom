import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Secret token to prevent unauthorized revalidation
// Set this in your .env.local file: REVALIDATION_SECRET=your-secret-key
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET || "your-secret-key-change-in-production";

// Cache tags used across the frontend
export const CACHE_TAGS = {
  HOME_PAGE: "home-page",
  SETTINGS: "settings",
  BANNERS: "banners",
  CATEGORIES: "categories",
  CATEGORY_PRODUCTS: (slug: string) => `category-products-${slug}`,
  PRODUCT: (slug: string) => `product-${slug}`,
  NAVBAR: "navbar",
  SUBNAVBAR_PRODUCTS: (slug: string) => `subnavbar-products-${slug}`,
  ANNOUNCEMENT_BAR: "announcement-bar",
  REVIEWS: "reviews",
  WISHLIST: "wishlist",
} as const;

export async function POST(request: NextRequest) {
  try {
    // Verify secret token
    const authHeader = request.headers.get("authorization");
    const body = await request.json().catch(() => ({}));
    const token = body.secret || authHeader?.replace("Bearer ", "");

    if (token !== REVALIDATION_SECRET) {
      return NextResponse.json(
        { success: false, message: "Invalid secret" },
        { status: 401 }
      );
    }

    const { tag, tags } = body;

    // Revalidate single tag
    if (tag) {
      revalidateTag(tag, "max");
      return NextResponse.json({
        success: true,
        message: `Revalidated tag: ${tag}`,
        revalidated: [tag],
      });
    }

    // Revalidate multiple tags
    if (tags && Array.isArray(tags)) {
      for (const t of tags) {
        revalidateTag(t, "max");
      }
      return NextResponse.json({
        success: true,
        message: `Revalidated ${tags.length} tags`,
        revalidated: tags,
      });
    }

    return NextResponse.json(
      { success: false, message: "Provide 'tag' or 'tags' in request body" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { success: false, message: "Revalidation failed" },
      { status: 500 }
    );
  }
}