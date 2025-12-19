import { relations } from "drizzle-orm";
import { products } from "./products";
import { categories } from "./categories";
import { genders } from "./filters/genders";
import { brands } from "./filters/brands";
import { productVariants } from "./variants";
import { reviews } from "./reviews";
import { wishlists } from "./wishlists";
import { productCollections } from "./product-collections";

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  gender: one(genders, {
    fields: [products.genderId],
    references: [genders.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  defaultVariant: one(productVariants, {
    fields: [products.defaultVariantId],
    references: [productVariants.id],
  }),
  variants: many(productVariants),
  reviews: many(reviews),
  wishlists: many(wishlists),
  productCollections: many(productCollections),
}));

