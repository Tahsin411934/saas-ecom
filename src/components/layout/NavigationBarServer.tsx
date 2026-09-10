import { navbarService, type NavbarItem } from "@/services/navbar.service";
import { type Category } from "@/services/category.service";
import NavigationBar from "./NavigationBar";

interface NavigationBarServerProps {
  serverCategories: Category[];
}

export default async function NavigationBarServer({
  serverCategories,
}: NavigationBarServerProps) {
  let items: NavbarItem[] = [];

  try {
    const navbarRes = await navbarService.getAll();
    if (navbarRes.success && navbarRes.data.length > 0) {
      items = navbarRes.data;
    }
  } catch {
    // API unavailable – render empty/default state
  }

  return <NavigationBar serverItems={items} serverCategories={serverCategories} />;
}
