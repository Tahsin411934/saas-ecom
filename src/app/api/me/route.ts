import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontFetch } from "@/lib/storefront-api";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

    const res = await storefrontFetch("auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "{}");
      return NextResponse.json({ success: false, message: "Not authenticated.", details: body }, { status: res.status });
    }

    const data = await res.json();
    // The backend wraps every payload in a `{ status, message, data }` envelope
    // (see src/app/actions/auth.ts apiRequest) — the user therefore sits at
    // `data.data.customer`, NOT at the top level. Fall back to a top-level `customer`
    // key in case the envelope is ever removed on the backend.
    const envelope = data as { data?: { customer?: unknown }; customer?: unknown } | null;
    const payload =
      envelope &&
      typeof envelope === "object" &&
      envelope.data !== null &&
      typeof envelope.data === "object"
        ? envelope.data
        : envelope;
    return NextResponse.json({ status: "success", user: payload?.customer ?? null });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Error fetching user." }, { status: 500 });
  }
}
