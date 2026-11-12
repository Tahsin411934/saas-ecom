import ProductCard, { type ProductCardItem } from "@/components/ui/ProductCard";

interface ProductGridProps {
  products: ProductCardItem[];
  className?: string;
}

export default function ProductGrid({ products, className = "" }: ProductGridProps) {
  return (
    <div className={`grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
