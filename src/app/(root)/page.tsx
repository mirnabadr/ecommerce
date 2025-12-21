import React from "react";
import { getAllProducts } from "@/lib/actions/product";
import { Card } from "@/components/Card";

const Home = async () => {
  // Fetch latest products from database
  const { products: productList } = await getAllProducts({
    sortBy: "latest",
    limit: 6,
  });

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <section aria-labelledby="latest" className="pb-12">
        <h2 id="latest" className="mb-4 text-2xl font-bold text-gray-900">
          Latest shoes
        </h2>
        {productList.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productList.map((product) => {
              // Determine badge
              let badge: { label: string; tone: "orange" | "red" | "green" } | undefined;
              const hasSale = product.minPrice < product.maxPrice;
              if (hasSale) {
                badge = { label: "On Sale", tone: "green" };
              }

              // Get primary image (first image)
              const primaryImage = product.images && product.images.length > 0 
                ? product.images[0] 
                : "/shoes/shoe-1.jpg";

              return (
                <Card
                  key={product.id}
                  title={product.name}
                  subtitle={`${product.gender.label}'s ${product.category.name}`}
                  meta={product.minPrice !== product.maxPrice 
                    ? `$${product.minPrice.toFixed(2)} - $${product.maxPrice.toFixed(2)}` 
                    : undefined}
                  price={product.minPrice}
                  imageSrc={primaryImage}
                  badge={badge}
                  href={`/products/${product.id}`}
                  productId={product.id}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-gray-500 mb-2">No products available</p>
            <p className="text-sm text-gray-400">
              Check back soon for our latest collection
            </p>
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;