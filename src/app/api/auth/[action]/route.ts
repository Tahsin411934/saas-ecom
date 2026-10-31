import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { storefrontFetch } from "@/lib/storefront-api";

const publicActions = new Set(["register", "login", "forgot-password", "reset-password"]);
const protectedActions = new Set(["logout", "logout-all", "change-password", "refresh"]);

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params;
  if (!publicActions.has(action) && !protectedActions.has(action)) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (protectedActions.has(action) && !token) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }
  try {
    const response = await storefrontFetch(`auth/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(protectedActions.has(action) && token ? { Authorization: `Bearer ${token}` } : {}) },
      body: await request.text(),
    });
    const raw = await response.json();
    if (!response.ok) return NextResponse.json(raw, { status: response.status });
    const payload = raw.data ?? {};
    if (payload.token) cookieStore.set("token", payload.token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
    });
    if (action === "logout" || action === "logout-all") cookieStore.delete("token");
    return NextResponse.json({ ...raw, ...payload, ...(payload.customer ? { user: payload.customer } : {}) });
  } catch {
    return NextResponse.json({ message: "Unable to contact the store. Please try again." }, { status: 502 });
  }
}
