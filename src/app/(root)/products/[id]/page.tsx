import { Suspense } from "react";
import { getProduct } from "@/lib/actions/product";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductReviews, ProductReviewsSkeleton } from "@/components/ProductReviews";
import { RecommendedProducts, RecommendedProductsSkeleton } from "@/components/RecommendedProducts";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">
            The product you're looking for doesn't exist or may have been removed.
          </p>
          <a
            href="/products"
            className="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: product.name },
          ]}
        />

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          <ProductDetailClient product={product} />
        </div>

        {/* Reviews Section - Wrapped in Suspense */}
        <div className="mt-16 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
          <Suspense fallback={<ProductReviewsSkeleton />}>
            <ProductReviews productId={product.id} />
          </Suspense>
        </div>

        {/* Recommended Products Section - Wrapped in Suspense */}
        <Suspense fallback={<RecommendedProductsSkeleton />}>
          <RecommendedProducts productId={product.id} />
        </Suspense>
      </div>
    </div>
  );
}

