import { getProduct, getAllProducts } from "@/lib/actions/product";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { Card } from "@/components/Card";
import { Breadcrumb } from "@/components/Breadcrumb";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  // Get related products for "You Might Also Like" section
  const { products: relatedProducts } = await getAllProducts({
    category: [product.category.slug],
    limit: 4,
  });

  // Filter out current product
  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id).slice(0, 3);

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

        {/* You Might Also Like Section */}
        {filteredRelated.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRelated.map((relatedProduct) => {
                // Determine badge
                let badge: { label: string; tone: "orange" | "red" | "green" } | undefined;
                const hasSale = relatedProduct.minPrice < relatedProduct.maxPrice;
                if (hasSale) {
                  badge = { label: "Extra 20% off", tone: "green" };
                }

                const displayPrice = relatedProduct.minPrice;
                const primaryImage = relatedProduct.images && relatedProduct.images.length > 0 
                  ? relatedProduct.images[0] 
                  : "/shoes/shoe-1.jpg";

                return (
                  <Card
                    key={relatedProduct.id}
                    title={relatedProduct.name}
                    subtitle={`${relatedProduct.gender.label}'s ${relatedProduct.category.name}`}
                    meta={relatedProduct.minPrice !== relatedProduct.maxPrice 
                      ? `$${relatedProduct.minPrice.toFixed(2)} - $${relatedProduct.maxPrice.toFixed(2)}` 
                      : undefined}
                    price={displayPrice}
                    imageSrc={primaryImage}
                    badge={badge}
                    href={`/products/${relatedProduct.id}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

