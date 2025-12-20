import { getAllProducts } from "@/lib/actions/product";
import { parseFilterParams } from "@/lib/utils/query";
import { Filters } from "@/components/Filters";
import { Sort } from "@/components/Sort";
import { Card } from "@/components/Card";
import { FilterButton } from "@/components/FilterButton";
import { MobileFilterToggle } from "@/components/MobileFilterToggle";

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  
  // Parse filter parameters
  const filters = parseFilterParams(params);
  
  // Fetch products using the optimized action
  const { products: productList, totalCount } = await getAllProducts(filters);

  // Build active filters for display - also check raw params for price array format
  const priceParams = params.price;
  const priceArray = Array.isArray(priceParams) ? priceParams : priceParams ? [priceParams] : [];
  
  const activeFilters = [
    ...(filters.gender || []).map((g) => ({ 
      key: "gender" as const, 
      value: g, 
      label: g.charAt(0).toUpperCase() + g.slice(1) 
    })),
    ...(filters.size || []).map((s) => ({ 
      key: "size" as const, 
      value: s, 
      label: `Size: ${s.toUpperCase()}` 
    })),
    ...(filters.color || []).map((c) => ({ 
      key: "color" as const, 
      value: c, 
      label: c.charAt(0).toUpperCase() + c.slice(1) 
    })),
    ...(filters.brand || []).map((b) => ({ 
      key: "brand" as const, 
      value: b, 
      label: b.charAt(0).toUpperCase() + b.slice(1) 
    })),
    ...(filters.category || []).map((c) => ({ 
      key: "category" as const, 
      value: c, 
      label: c.charAt(0).toUpperCase() + c.slice(1) 
    })),
    // Handle price filters from URL (e.g., price[]=25-50)
    ...priceArray.map((p) => {
      const labels: Record<string, string> = {
        "25-50": "$25 - $50",
        "50-100": "$50 - $100",
        "100-150": "$100 - $150",
        "150+": "Over $150",
      };
      return {
        key: "price" as const,
        value: p,
        label: labels[p] || p,
      };
    }),
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Products {totalCount > 0 && `(${totalCount})`}
          </h1>
          <p className="text-gray-600">Browse our latest collection</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <Filters />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden">
                <MobileFilterToggle />
              </div>

              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter) => (
                    <FilterButton
                      key={`${filter.key}-${filter.value}`}
                      filterKey={filter.key}
                      value={filter.value}
                      label={filter.label}
                    />
                  ))}
                </div>
              )}

              {/* Sort */}
              <div className="ml-auto">
                <Sort />
              </div>
            </div>

            {/* Products Grid */}
            {productList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productList.map((product) => {
                  // Determine badge
                  let badge: { label: string; tone: "orange" | "red" | "green" } | undefined;
                  const hasSale = product.minPrice < product.maxPrice;
                  if (hasSale) {
                    badge = { label: "On Sale", tone: "green" };
                  }

                  // Use minPrice as display price, show range if different
                  const displayPrice = product.minPrice;
                  const showPriceRange = product.minPrice !== product.maxPrice;

                  // Get primary image (first image)
                  const primaryImage = product.images && product.images.length > 0 
                    ? product.images[0] 
                    : "/shoes/shoe-1.jpg";

                  return (
                    <Card
                      key={product.id}
                      title={product.name}
                      subtitle={`${product.gender.label}'s ${product.category.name}`}
                      meta={showPriceRange ? `$${product.minPrice.toFixed(2)} - $${product.maxPrice.toFixed(2)}` : undefined}
                      price={displayPrice}
                      imageSrc={primaryImage}
                      badge={badge}
                      href={`/products/${product.id}`}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-gray-500 mb-2">No products found</p>
                <p className="text-sm text-gray-400">
                  Try adjusting your filters to see more results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

