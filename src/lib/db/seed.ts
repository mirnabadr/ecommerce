import { db } from "./index";
import {
  genders,
  colors,
  sizes,
  brands,
  categories,
  collections,
  products,
  productVariants,
  productImages,
  productCollections,
  insertGenderSchema,
  insertColorSchema,
  insertSizeSchema,
  insertBrandSchema,
  insertCategorySchema,
  insertCollectionSchema,
  insertProductSchema,
  insertProductVariantSchema,
  insertProductImageSchema,
  insertProductCollectionSchema,
} from "./schema";
import { eq } from "drizzle-orm";

// Nike product data
const nikeProductsData = [
  {
    name: "Nike Air Max 90",
    description: "Classic running shoes with visible Air cushioning. The Nike Air Max 90 stays true to its OG running roots with the iconic Waffle outsole, stitched overlays and classic TPU accents.",
    category: "Running",
    gender: "Men",
  },
  {
    name: "Nike Air Force 1",
    description: "The icon of hoops style returns with classic details and throwback hoops flair. The rubber outsole adds heritage style, perfect for everyday wear.",
    category: "Lifestyle",
    gender: "Men",
  },
  {
    name: "Nike Dunk Low",
    description: "The Nike Dunk Low returns with classic colors and throwback hoops flair. The rubber outsole adds heritage style, perfect for everyday wear.",
    category: "Lifestyle",
    gender: "Men",
  },
  {
    name: "Nike React Infinity Run",
    description: "Long-distance running shoes with React foam technology. Designed to help reduce injury and keep you running.",
    category: "Running",
    gender: "Men",
  },
  {
    name: "Nike Air Zoom Pegasus",
    description: "Your workhorse with wings. The Nike Air Zoom Pegasus returns with responsive cushioning and a breathable upper.",
    category: "Running",
    gender: "Women",
  },
  {
    name: "Nike Blazer Mid '77",
    description: "In the '70s, Nike was the new shoe on the block. So new, in fact, we were still breaking into the basketball scene and testing prototypes on the feet of our local team.",
    category: "Lifestyle",
    gender: "Women",
  },
  {
    name: "Nike Air Max 270",
    description: "The Nike Air Max 270 delivers visible cushioning under every step. The design draws inspiration from Air Max icons, showcasing Nike's greatest innovation with its large window and fresh array of colors.",
    category: "Running",
    gender: "Men",
  },
  {
    name: "Nike Cortez",
    description: "The Nike Cortez stays true to its 1972 roots with the iconic design that made it famous. The leather upper adds durability and classic style.",
    category: "Lifestyle",
    gender: "Unisex",
  },
  {
    name: "Nike Vaporfly Next%",
    description: "Built for racing. The Nike Vaporfly Next% features our most responsive foam yet for a propulsive feel that helps you push your pace.",
    category: "Running",
    gender: "Men",
  },
  {
    name: "Nike Air Max 97",
    description: "The Nike Air Max 97 keeps the sleek look of the original running shoe with a full-length Max Air unit for cushioning.",
    category: "Lifestyle",
    gender: "Women",
  },
  {
    name: "Nike Free RN",
    description: "The Nike Free RN is designed to let your foot move naturally. The flexible outsole and breathable upper provide a barefoot-like feel.",
    category: "Running",
    gender: "Women",
  },
  {
    name: "Nike SB Dunk Low",
    description: "The Nike SB Dunk Low brings original '80s basketball styling to skateboarding. The padded collar and Zoom Air unit add comfort and support.",
    category: "Skateboarding",
    gender: "Men",
  },
  {
    name: "Nike Air Max 95",
    description: "The Nike Air Max 95 combines an upper inspired by human anatomy with visible Max Air cushioning for comfort and style.",
    category: "Lifestyle",
    gender: "Unisex",
  },
  {
    name: "Nike ZoomX Vaporfly",
    description: "Built for speed. The Nike ZoomX Vaporfly features our most responsive foam and a carbon fiber plate for a propulsive feel.",
    category: "Running",
    gender: "Women",
  },
  {
    name: "Nike Air Max 1",
    description: "The Nike Air Max 1 brings back the iconic design that started it all. The visible Air cushioning and classic colors make it a timeless favorite.",
    category: "Lifestyle",
    gender: "Unisex",
  },
];

const colorData = [
  { name: "Black", slug: "black", hexCode: "#000000" },
  { name: "White", slug: "white", hexCode: "#FFFFFF" },
  { name: "Red", slug: "red", hexCode: "#FF0000" },
  { name: "Blue", slug: "blue", hexCode: "#0066CC" },
  { name: "Gray", slug: "gray", hexCode: "#808080" },
  { name: "Green", slug: "green", hexCode: "#00CC00" },
  { name: "Orange", slug: "orange", hexCode: "#FF6600" },
  { name: "Pink", slug: "pink", hexCode: "#FF99CC" },
];

const sizeData = [
  { name: "6", slug: "6", sortOrder: 1 },
  { name: "6.5", slug: "6-5", sortOrder: 2 },
  { name: "7", slug: "7", sortOrder: 3 },
  { name: "7.5", slug: "7-5", sortOrder: 4 },
  { name: "8", slug: "8", sortOrder: 5 },
  { name: "8.5", slug: "8-5", sortOrder: 6 },
  { name: "9", slug: "9", sortOrder: 7 },
  { name: "9.5", slug: "9-5", sortOrder: 8 },
  { name: "10", slug: "10", sortOrder: 9 },
  { name: "10.5", slug: "10-5", sortOrder: 10 },
  { name: "11", slug: "11", sortOrder: 11 },
  { name: "11.5", slug: "11-5", sortOrder: 12 },
  { name: "12", slug: "12", sortOrder: 13 },
];

const genderData = [
  { label: "Men", slug: "men" },
  { label: "Women", slug: "women" },
  { label: "Unisex", slug: "unisex" },
];

const categoryData = [
  { name: "Running", slug: "running", parentId: null },
  { name: "Lifestyle", slug: "lifestyle", parentId: null },
  { name: "Skateboarding", slug: "skateboarding", parentId: null },
  { name: "Basketball", slug: "basketball", parentId: null },
];

const collectionData = [
  { name: "Summer '25", slug: "summer-25" },
  { name: "Classic Collection", slug: "classic-collection" },
  { name: "Performance", slug: "performance" },
  { name: "Limited Edition", slug: "limited-edition" },
];

// Helper function to get random element from array
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random elements from array
function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

async function seed() {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Clear existing data (in reverse order of dependencies)
    console.log("🧹 Clearing existing data...");
    await db.delete(productCollections);
    await db.delete(productImages);
    await db.delete(productVariants);
    await db.delete(products);
    await db.delete(collections);
    await db.delete(categories);
    await db.delete(brands);
    await db.delete(sizes);
    await db.delete(colors);
    await db.delete(genders);
    console.log("✅ Cleared existing data\n");

    // Step 1: Seed Genders
    console.log("📝 Seeding genders...");
    const insertedGenders = await db
      .insert(genders)
      .values(genderData.map((g) => insertGenderSchema.parse(g)))
      .returning({ id: genders.id, label: genders.label, slug: genders.slug });
    console.log(`✅ Inserted ${insertedGenders.length} genders\n`);

    // Step 2: Seed Colors
    console.log("📝 Seeding colors...");
    const insertedColors = await db
      .insert(colors)
      .values(colorData.map((c) => insertColorSchema.parse(c)))
      .returning({ id: colors.id, name: colors.name, slug: colors.slug, hexCode: colors.hexCode });
    console.log(`✅ Inserted ${insertedColors.length} colors\n`);

    // Step 3: Seed Sizes
    console.log("📝 Seeding sizes...");
    const insertedSizes = await db
      .insert(sizes)
      .values(sizeData.map((s) => insertSizeSchema.parse(s)))
      .returning({ id: sizes.id, name: sizes.name, slug: sizes.slug, sortOrder: sizes.sortOrder });
    console.log(`✅ Inserted ${insertedSizes.length} sizes\n`);

    // Step 4: Seed Brand (Nike)
    console.log("📝 Seeding brands...");
    const nikeBrand = await db
      .insert(brands)
      .values(insertBrandSchema.parse({ name: "Nike", slug: "nike", logoUrl: null }))
      .returning({ id: brands.id, name: brands.name, slug: brands.slug, logoUrl: brands.logoUrl });
    console.log(`✅ Inserted brand: ${nikeBrand[0]?.name || "Nike"}\n`);

    // Step 5: Seed Categories
    console.log("📝 Seeding categories...");
    const insertedCategories = await db
      .insert(categories)
      .values(categoryData.map((c) => insertCategorySchema.parse(c)))
      .returning({ id: categories.id, name: categories.name, slug: categories.slug, parentId: categories.parentId });
    console.log(`✅ Inserted ${insertedCategories.length} categories\n`);

    // Step 6: Seed Collections
    console.log("📝 Seeding collections...");
    const insertedCollections = await db
      .insert(collections)
      .values(collectionData.map((c) => insertCollectionSchema.parse(c)))
      .returning({ id: collections.id, name: collections.name, slug: collections.slug });
    console.log(`✅ Inserted ${insertedCollections.length} collections\n`);

    // Step 7: Seed Products
    console.log("📝 Seeding products...");
    const insertedProducts = [];

    for (let i = 0; i < nikeProductsData.length; i++) {
      const productData = nikeProductsData[i];
      const category = insertedCategories.find((c) => c.slug === productData.category.toLowerCase());
      const gender = insertedGenders.find((g) => g.slug === productData.gender.toLowerCase());

      if (!category || !gender) {
        console.error(`❌ Error: Category or gender not found for product ${productData.name}`);
        continue;
      }

      const product = await db
        .insert(products)
        .values(
          insertProductSchema.parse({
            name: productData.name,
            description: productData.description,
            categoryId: category.id,
            genderId: gender.id,
            brandId: nikeBrand[0]!.id,
            isPublished: true,
            defaultVariantId: null,
          })
        )
        .returning({ id: products.id, name: products.name });

      insertedProducts.push(product[0]);
      console.log(`  ✓ Created product: ${productData.name}`);
    }
    console.log(`✅ Inserted ${insertedProducts.length} products\n`);

    // Step 8: Seed Product Variants and Images
    console.log("📝 Seeding product variants and images...");
    const shoeImages = [
      "shoe-1.jpg",
      "shoe-2.webp",
      "shoe-3.webp",
      "shoe-4.webp",
      "shoe-5.avif",
      "shoe-6.avif",
      "shoe-7.avif",
      "shoe-8.avif",
      "shoe-9.avif",
      "shoe-10.avif",
      "shoe-11.avif",
      "shoe-12.avif",
      "shoe-13.avif",
      "shoe-14.avif",
      "shoe-15.avif",
    ];

    let imageIndex = 0;
    const allVariants = [];

    for (let i = 0; i < insertedProducts.length; i++) {
      const product = insertedProducts[i];
      const productColors = getRandomElements(insertedColors, Math.floor(Math.random() * 3) + 2); // 2-4 colors per product
      const productSizes = getRandomElements(insertedSizes, Math.floor(Math.random() * 5) + 5); // 5-9 sizes per product

      const productVariantsList = [];
      let variantIndex = 0;

      for (const color of productColors) {
        for (const size of productSizes) {
          const basePrice = 80 + Math.floor(Math.random() * 120); // $80-$200
          const hasSale = Math.random() > 0.7; // 30% chance of sale
          const salePrice = hasSale ? basePrice * 0.8 : null;

          const variant = await db
            .insert(productVariants)
            .values(
              insertProductVariantSchema.parse({
                productId: product.id,
                sku: `NIKE-${product.name.replace(/\s+/g, "-").toUpperCase()}-${color.slug}-${size.slug}`,
                price: basePrice.toFixed(2),
                salePrice: salePrice ? salePrice.toFixed(2) : null,
                colorId: color.id,
                sizeId: size.id,
                inStock: Math.floor(Math.random() * 50) + 10, // 10-60 in stock
                weight: 0.5 + Math.random() * 0.5, // 0.5-1.0 kg
                dimensions: {
                  length: 25 + Math.random() * 5,
                  width: 10 + Math.random() * 2,
                  height: 8 + Math.random() * 2,
                },
              })
            )
            .returning({ id: productVariants.id, productId: productVariants.productId });

          productVariantsList.push(variant[0]);
          allVariants.push(variant[0]);

          // Add product images (1-3 images per color variant)
          if (variantIndex === 0) {
            // First variant gets the primary image
            const imageUrl = `/shoes/${shoeImages[imageIndex % shoeImages.length]}`;
            await db.insert(productImages).values(
              insertProductImageSchema.parse({
                productId: product.id,
                variantId: variant[0].id,
                url: imageUrl,
                sortOrder: 0,
                isPrimary: true,
              })
            );

            // Add 1-2 additional images for this variant
            const additionalImages = Math.floor(Math.random() * 2) + 1;
            for (let j = 1; j <= additionalImages; j++) {
              const nextImageIndex = (imageIndex + j) % shoeImages.length;
              await db.insert(productImages).values(
                insertProductImageSchema.parse({
                  productId: product.id,
                  variantId: variant[0].id,
                  url: `/shoes/${shoeImages[nextImageIndex]}`,
                  sortOrder: j,
                  isPrimary: false,
                })
              );
            }
            imageIndex++;
          }
          variantIndex++;
        }
      }

      // Set default variant (first variant)
      if (productVariantsList.length > 0) {
        await db
          .update(products)
          .set({ defaultVariantId: productVariantsList[0].id })
          .where(eq(products.id, product.id));
      }

      console.log(`  ✓ Created ${productVariantsList.length} variants for ${product.name}`);
    }
    console.log(`✅ Created ${allVariants.length} total variants\n`);

    // Step 9: Seed Product Collections
    console.log("📝 Seeding product collections...");
    let collectionCount = 0;
    for (const collection of insertedCollections) {
      const productsInCollection = getRandomElements(insertedProducts, Math.floor(Math.random() * 5) + 3); // 3-7 products per collection
      for (const product of productsInCollection) {
        await db.insert(productCollections).values(
          insertProductCollectionSchema.parse({
            productId: product.id,
            collectionId: collection.id,
          })
        );
        collectionCount++;
      }
    }
    console.log(`✅ Linked ${collectionCount} products to collections\n`);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Genders: ${insertedGenders.length}`);
    console.log(`   - Colors: ${insertedColors.length}`);
    console.log(`   - Sizes: ${insertedSizes.length}`);
    console.log(`   - Brands: 1`);
    console.log(`   - Categories: ${insertedCategories.length}`);
    console.log(`   - Collections: ${insertedCollections.length}`);
    console.log(`   - Products: ${insertedProducts.length}`);
    console.log(`   - Variants: ${allVariants.length}`);
    console.log(`   - Product-Collection links: ${collectionCount}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("\n✅ Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seed script failed:", error);
    process.exit(1);
  });
