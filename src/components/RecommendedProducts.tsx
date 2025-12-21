import { getRecommendedProducts } from "@/lib/actions/product";
import { Card } from "./Card";

interface RecommendedProductsProps {
  productId: string;
}

export async function RecommendedProducts({ productId }: RecommendedProductsProps) {
  const recommendedProducts = await getRecommendedProducts(productId);

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedProducts.map((product) => (
          <Card
            key={product.id}
            title={product.title}
            subtitle=""
            price={product.price}
            imageSrc={product.mainImage}
            href={`/products/${product.id}`}
          />
        ))}
      </div>
    </div>
  );
}

export function RecommendedProductsSkeleton() {
  return (
    <div className="mt-16">
      <div className="h-8 bg-gray-200 rounded w-64 mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
            <div className="w-full aspect-square bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

