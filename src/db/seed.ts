import { db } from "./index";
import { products } from "./schema";

const nikeProducts = [
  {
    name: "Nike Air Max 90",
    description: "Classic running shoes with visible Air cushioning",
    price: "120.00",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    category: "Shoes",
    brand: "Nike",
    stock: 50,
  },
  {
    name: "Nike Dri-FIT T-Shirt",
    description: "Moisture-wicking performance t-shirt",
    price: "35.00",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    category: "Apparel",
    brand: "Nike",
    stock: 100,
  },
  {
    name: "Nike Air Force 1",
    description: "The icon of hoops style returns with classic details",
    price: "90.00",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500",
    category: "Shoes",
    brand: "Nike",
    stock: 75,
  },
  {
    name: "Nike Sportswear Hoodie",
    description: "Comfortable hoodie for everyday wear",
    price: "65.00",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a4?w=500",
    category: "Apparel",
    brand: "Nike",
    stock: 60,
  },
  {
    name: "Nike React Infinity Run",
    description: "Long-distance running shoes with React foam",
    price: "160.00",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500",
    category: "Shoes",
    brand: "Nike",
    stock: 40,
  },
  {
    name: "Nike Pro Shorts",
    description: "Performance shorts for training and competition",
    price: "28.00",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500",
    category: "Apparel",
    brand: "Nike",
    stock: 80,
  },
];

async function seed() {
  try {
    console.log("Seeding database with Nike products...");
    
    // Clear existing products (optional - remove if you want to keep existing data)
    await db.delete(products);
    
    // Insert Nike products
    await db.insert(products).values(nikeProducts);
    
    console.log("✅ Successfully seeded database with Nike products!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();

