import { bannerService, type Banner } from "@/services/banner.service";
import HeroBanner from "./HeroBanner";

export default async function HeroBannerServer() {
  let banners: Banner[] = [];

  try {
    const res = await bannerService.getAll();
    if (res.success && res.data.length > 0) {
      banners = res.data;
    }
  } catch {
    // API unavailable – render empty state
  }

  return <HeroBanner banners={banners} />;
}