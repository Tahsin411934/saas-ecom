import { homeService } from "@/services/home.service";
import HomePage from "./HomePage";

export default async function HomePageServer() {
  let sections: Awaited<ReturnType<typeof homeService.getHomePageData>> = [];

  try {
    sections = await homeService.getHomePageData({
      limit_categories: 15,
      limit_products: 8,
    });
  } catch (err) {
    // API unavailable during build – render empty state gracefully
    console.error("HomePageServer: failed to fetch products-by-category", err);
  }
  console.log("HomePageServer: sections", sections);

  return <HomePage sections={sections} />;
}
