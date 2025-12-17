import { db } from "@/db";
import { products } from "@/db/schema";
import { Product } from "@/db/schema";
import { ProductCard } from "@/components/ProductCard";

async function getProducts(): Promise<Product[]> {
  const allProducts = await db.select().from(products);
  return allProducts;
}

export default async function Home() {
  const productsList = await getProducts();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
          Nike Store
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Discover the latest Nike products
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsList.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {productsList.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No products found. Run the seed script to add sample products.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

