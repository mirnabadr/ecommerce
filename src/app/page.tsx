import { db } from "@/db";
import { products } from "@/db/schema";
import { Product } from "@/db/schema";
import { CardList } from "@/components/CardList";

async function getProducts(): Promise<Product[]> {
  const allProducts = await db.select().from(products);
  return allProducts;
}

export default async function Home() {
  const productsList = await getProducts();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <CardList products={productsList} title="Featured Products" showBestSeller />
      </div>
    </main>
  );
}
