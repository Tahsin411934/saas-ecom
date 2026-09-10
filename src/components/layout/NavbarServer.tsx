import { categoryService, type Category } from "@/services/category.service";
import { announcementBarService, type AnnouncementBar } from "@/services/announcement-bar.service";
import { settingsService } from "@/services/settings.service";
import TopHeaderBar from "./TopHeaderBar";
import MainHeader from "./MainHeader";
import NavigationBarServer from "./NavigationBarServer";
import { cookies } from "next/headers";
import { buildApiUrl } from "@/lib/api-url";

export interface Settings {
  site_name?: string;
  site_logo?: string;
  site_description?: string;
  primary_color?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  whatsapp_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  meta_title?: string;
  meta_description?: string;
}

async function fetchServerUser(): Promise<any> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const res = await fetch(buildApiUrl("/api/v1/me"), {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    // The backend wraps every payload in a `{ status, message, data }` envelope
    // (see src/app/actions/auth.ts apiRequest) — the user therefore sits at
    // `data.data.user`, NOT at the top level. Fall back to a top-level `user`
    // key in case the envelope is ever removed on the backend.
    const envelope = data as { data?: unknown; user?: unknown } | null;
    const payload =
      envelope &&
      typeof envelope === "object" &&
      envelope.data !== null &&
      typeof envelope.data === "object"
        ? (envelope.data as { user?: unknown })
        : envelope;
    return payload?.user ?? null;
  } catch {
    return null;
  }
}

export default async function NavbarServer() {
  const [categories, announcementBars, settings, serverUser] = await Promise.all([
    categoryService.getAll().then((r) => (r.success ? r.data.filter((c: Category) => c.status === "active") : [])).catch(() => [] as Category[]),
    announcementBarService.getAll().then((r) => (r.success ? r.data : [])).catch(() => [] as AnnouncementBar[]),
    settingsService.getAll().then((r) => (r.success ? (r.data as unknown as Settings) : {})).catch(() => ({}) as Settings),
    fetchServerUser(),
  ]);

  return (
    <>
      <TopHeaderBar serverAnnouncementBars={announcementBars} />
      <MainHeader serverCategories={categories} serverSettings={settings} serverUser={serverUser} />
      <NavigationBarServer serverCategories={categories} />
    </>
  );
}