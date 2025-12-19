import { relations } from "drizzle-orm";
import { genders } from "./filters/genders";
import { brands } from "./filters/brands";
import { colors } from "./filters/colors";
import { sizes } from "./filters/sizes";
import { products } from "./products";
import { productVariants } from "./variants";

export const gendersRelations = relations(genders, ({ many }) => ({
  products: many(products),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const colorsRelations = relations(colors, ({ many }) => ({
  productVariants: many(productVariants),
}));

export const sizesRelations = relations(sizes, ({ many }) => ({
  productVariants: many(productVariants),
}));

