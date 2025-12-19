# Database Migration Guide

## Step-by-Step Migration Process

### Step 1: Handle the Migration Prompt

When you run `npm run db:push`, Drizzle will ask about column changes. For each prompt:

**For `category_id`:**
- Select: `+ category_id` (create column)

**For other new columns (`gender_id`, `brand_id`, `is_published`, `default_variant_id`):**
- Select: `+ column_name` (create column) for each

**For old columns that no longer exist (`price`, `image`, `category`, `brand`, `stock`):**
- These will be automatically dropped since they're not in the new schema

### Step 2: Run Database Push

```bash
npm run db:push
```

This will:
- Create all new tables (filters, categories, collections, variants, etc.)
- Update the products table structure
- Set up all foreign key relationships

### Step 3: Run Seed Script

```bash
npm run db:seed
```

This will:
- Populate filters (genders, colors, sizes, brands)
- Create categories and collections
- Insert 15 Nike products with variants
- Link product images
- Connect products to collections

## Important Notes

⚠️ **Data Loss Warning**: The old products table structure is incompatible with the new one. If you have important data in the old products table, you'll need to migrate it manually before running `db:push`.

✅ **For Development**: If you're in development and don't need the old data, it's safe to proceed with the migration.

## Troubleshooting

If you encounter errors:
1. Check that all schema files are properly exported in `src/lib/db/schema/index.ts`
2. Verify your `.env.local` has the correct `DATABASE_URL`
3. Make sure all dependencies are installed: `npm install`

