import React from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  mainImage?: string;
  image?: string;
  rating?: number;
  brand?: string;
  [key: string]: any;
}

interface BestSellersSectionProps {
  products: Product[];
}

const BestSellersSection: React.FC<BestSellersSectionProps> = ({ products }) => {
  if (!products || products.length === 0) return null;

  // Sort by rating or price desc for demonstration
  const topProducts = [...products]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  return (
    <section className="bg-beige-50 py-20">
      <div className="container-responsive space-y-12">
        <h2 className="text-responsive-3xl font-luxury text-burgundy-700 text-center">
          الأكثر مبيعاً
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {topProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id.toString(),
                name: p.name,
                price: p.price,
                originalPrice: p.originalPrice,
                image: p.mainImage || (p.image as string) || '/placeholder-image.png',
                category: '',
                rating: p.rating,
                brand: p.brand,
                inStock: true,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellersSection; 