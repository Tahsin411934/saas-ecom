"use client";

import CategorySection from "./CategorySection";
import CtaSection from "./CtaSection";
import { type HomeSection } from "@/services/home.service";

interface HomePageProps {
  sections: HomeSection[];
}

export default function HomePage({ sections }: HomePageProps) {
  if (!sections || sections.length === 0) {
    return (
      <div className="py-16 text-center text-gray-600">
        <p className="text-lg font-medium">The homepage is loading or has no sections yet.</p>
        <p className="mt-2 text-sm">Try refreshing the page or come back shortly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-8">
      {sections.map((section, index) => {
        if (section.type === "category_section") {
          return (
            <CategorySection
              key={`cat-${section.category.id}-${index}`}
              category={section.category}
              products={section.products}
            />
          );
        }
        if (section.type === "cta_section") {
          return (
            <CtaSection
              key={`cta-${section.id}-${index}`}
              cta={section}
            />
          );
        }
        return null;
      })}
    </div>
  );
}