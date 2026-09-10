import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Grid3X3, Package } from "lucide-react";
import { type Category } from "@/services/category.service";

interface AllCategoriesPageProps {
  categories: Category[];
}

export default function AllCategoriesPage({ categories }: AllCategoriesPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-[1200px] px-4">
          <nav className="flex items-center gap-2 py-4 text-xs text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">
              Home
            </Link>
            <ChevronLeft className="h-3 w-3 rotate-180" aria-hidden="true" />
            <span className="text-gray-900 font-medium">Categories</span>
          </nav>

          <div className="flex flex-col items-start gap-2 pb-6 md:pb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              <Grid3X3 className="h-3.5 w-3.5" aria-hidden="true" />
              Shop by category
            </span>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">All Categories</h1>
            <p className="text-sm text-gray-500">
              {categories.length > 0
                ? `Explore our ${categories.length} ${categories.length === 1 ? "category" : "categories"} and find what you love.`
                : "Browse everything we have in store."}
            </p>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <Package className="h-10 w-10 text-gray-300" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-700">No categories available right now.</p>
            <p className="text-xs text-gray-500">Please check back soon or explore our products.</p>
            <Link
              href="/"
              className="mt-2 inline-flex h-10 items-center rounded-full bg-[var(--color-primary)] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="group flex h-full flex-col items-center gap-3 rounded-3xl border border-gray-200 bg-white px-4 py-6 text-center transition hover:border-[var(--color-primary)] hover:shadow-lg"
                  aria-label={`Shop ${category.name}`}
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gray-100 shadow-sm ring-2 ring-transparent transition-all duration-200 group-hover:ring-[var(--color-primary)] group-hover:shadow-md">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="80px"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 text-xl font-bold text-[var(--color-primary)]">
                        {category.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <span className="line-clamp-2 text-sm font-medium leading-tight text-gray-700 transition-colors group-hover:text-[var(--color-primary)]">
                    {category.name}
                  </span>

                  {typeof category.products_count === "number" && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">
                      {category.products_count} {category.products_count === 1 ? "product" : "products"}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}