import { categoryService, type Category } from "@/services/category.service";
import CategoryScroll from "./CategoryScroll";


export default async function CategoryScrollServer() {
  let categories: Category[] = [];
        
  try {
    const res = await categoryService.getAll();
    if (res.success && res.data.length > 0) {
      categories = res.data;
      
    }
  } catch {
    // API unavailable – render empty state
  }

  if (categories.length === 0) return null;

  return <CategoryScroll categories={categories} />;
}