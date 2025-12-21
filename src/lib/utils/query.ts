import queryString from "query-string";
import { ReadonlyURLSearchParams } from "next/navigation";
import type { ProductFilters } from "@/lib/actions/product";

export type FilterParams = {
  gender?: string[];
  size?: string[];
  color?: string[];
  brand?: string[];
  category?: string[];
  price?: string[];
  sort?: string;
};

/**
 * Parse URL search params into ProductFilters format for getAllProducts
 * Handles search, filters, price range, sorting, and pagination
 */
export function parseFilterParams(
  searchParams: ReadonlyURLSearchParams | URLSearchParams | Record<string, string | string[] | undefined>
): ProductFilters {
  // Convert to plain object if it's URLSearchParams
  let params: Record<string, string | string[] | undefined>;
  if (searchParams instanceof URLSearchParams || (searchParams as any).entries) {
    params = parseSearchParams(searchParams as URLSearchParams);
  } else {
    params = searchParams;
  }

  const filters: ProductFilters = {};

  // Search
  if (params.search && typeof params.search === "string") {
    filters.search = params.search.trim();
  }

  // Gender filter
  if (params.gender) {
    filters.gender = Array.isArray(params.gender) ? params.gender : [params.gender];
  }

  // Brand filter
  if (params.brand) {
    filters.brand = Array.isArray(params.brand) ? params.brand : [params.brand];
  }

  // Category filter
  if (params.category) {
    filters.category = Array.isArray(params.category) ? params.category : [params.category];
  }

  // Color filter
  if (params.color) {
    filters.color = Array.isArray(params.color) ? params.color : [params.color];
  }

  // Size filter
  if (params.size) {
    filters.size = Array.isArray(params.size) ? params.size : [params.size];
  }

  // Price range
  if (params.priceMin) {
    const priceMin = parseFloat(
      Array.isArray(params.priceMin) ? params.priceMin[0] : params.priceMin
    );
    if (!isNaN(priceMin)) {
      filters.priceMin = priceMin;
    }
  }
  if (params.priceMax) {
    const priceMax = parseFloat(
      Array.isArray(params.priceMax) ? params.priceMax[0] : params.priceMax
    );
    if (!isNaN(priceMax)) {
      filters.priceMax = priceMax;
    }
  }

  // Handle price ranges from price array (e.g., "25-50", "50-100")
  if (params.price && !filters.priceMin && !filters.priceMax) {
    const priceRanges = Array.isArray(params.price) ? params.price : [params.price];
    // Parse price ranges if needed - for now we'll handle this in the component
    // But we can also extract min/max from ranges like "25-50"
    for (const range of priceRanges) {
      if (typeof range === "string") {
        if (range.includes("-")) {
          const [min, max] = range.split("-").map(Number);
          if (!isNaN(min) && !isNaN(max)) {
            if (!filters.priceMin || min < filters.priceMin) {
              filters.priceMin = min;
            }
            if (!filters.priceMax || max > filters.priceMax) {
              filters.priceMax = max;
            }
          }
        } else if (range.endsWith("+")) {
          const min = parseFloat(range.replace("+", ""));
          if (!isNaN(min)) {
            if (!filters.priceMin || min < filters.priceMin) {
              filters.priceMin = min;
            }
          }
        }
      }
    }
  }

  // Sorting
  if (params.sort || params.sortBy) {
    const sortValue = (params.sort || params.sortBy) as string;
    if (sortValue) {
      // Map common sort values
      switch (sortValue) {
        case "newest":
        case "latest":
          filters.sortBy = "latest";
          break;
        case "price_asc":
        case "price-low":
          filters.sortBy = "price_asc";
          break;
        case "price_desc":
        case "price-high":
          filters.sortBy = "price_desc";
          break;
        default:
          filters.sortBy = sortValue;
      }
    }
  }

  // Pagination
  if (params.page) {
    const page = parseInt(
      Array.isArray(params.page) ? params.page[0] : params.page,
      10
    );
    if (!isNaN(page) && page > 0) {
      filters.page = page;
    }
  }
  if (params.limit) {
    const limit = parseInt(
      Array.isArray(params.limit) ? params.limit[0] : params.limit,
      10
    );
    if (!isNaN(limit) && limit > 0) {
      filters.limit = limit;
    }
  }

  return filters;
}

/**
 * Helper to parse URLSearchParams with array support
 */
function parseSearchParams(searchParams: ReadonlyURLSearchParams | URLSearchParams): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};
  
  // URLSearchParams.getAll() handles arrays properly
  for (const [key, value] of searchParams.entries()) {
    // Remove array brackets from key if present
    const cleanKey = key.replace(/\[\]$/, '');
    
    if (params[cleanKey]) {
      // If key already exists, convert to array
      if (Array.isArray(params[cleanKey])) {
        (params[cleanKey] as string[]).push(value);
      } else {
        params[cleanKey] = [params[cleanKey] as string, value];
      }
    } else {
      // Check if there are multiple values for this key
      const allValues = searchParams.getAll(key);
      if (allValues.length > 1) {
        params[cleanKey] = allValues;
      } else {
        params[cleanKey] = value;
      }
    }
  }
  
  return params;
}

/**
 * Parse URL search params into filter object
 */
export function parseFilters(searchParams: ReadonlyURLSearchParams | URLSearchParams): FilterParams {
  const params = parseSearchParams(searchParams);
  
  return {
    gender: params.gender ? (Array.isArray(params.gender) ? params.gender : [params.gender]) : undefined,
    size: params.size ? (Array.isArray(params.size) ? params.size : [params.size]) : undefined,
    color: params.color ? (Array.isArray(params.color) ? params.color : [params.color]) : undefined,
    price: params.price ? (Array.isArray(params.price) ? params.price : [params.price]) : undefined,
    sort: params.sort ? (typeof params.sort === 'string' ? params.sort : params.sort[0]) : undefined,
  };
}

/**
 * Add a filter value to the URL params
 */
export function addFilter(
  currentParams: Record<string, string | string[] | undefined>,
  filterKey: keyof FilterParams,
  value: string
): Record<string, string | string[] | undefined> {
  const current = currentParams[filterKey];
  const currentArray = Array.isArray(current) ? current : current ? [current] : [];
  
  if (currentArray.includes(value)) {
    return currentParams; // Already exists
  }
  
  return {
    ...currentParams,
    [filterKey]: [...currentArray, value],
  };
}

/**
 * Remove a filter value from the URL params
 */
export function removeFilter(
  currentParams: Record<string, string | string[] | undefined>,
  filterKey: keyof FilterParams,
  value: string
): Record<string, string | string[] | undefined> {
  const current = currentParams[filterKey];
  const currentArray = Array.isArray(current) ? current : current ? [current] : [];
  
  const filtered = currentArray.filter((v) => v !== value);
  
  if (filtered.length === 0) {
    const { [filterKey]: _, ...rest } = currentParams;
    return rest;
  }
  
  return {
    ...currentParams,
    [filterKey]: filtered,
  };
}

/**
 * Toggle a filter value (add if not present, remove if present)
 */
export function toggleFilter(
  currentParams: Record<string, string | string[] | undefined>,
  filterKey: keyof FilterParams,
  value: string
): Record<string, string | string[] | undefined> {
  const current = currentParams[filterKey];
  const currentArray = Array.isArray(current) ? current : current ? [current] : [];
  
  if (currentArray.includes(value)) {
    return removeFilter(currentParams, filterKey, value);
  } else {
    return addFilter(currentParams, filterKey, value);
  }
}

/**
 * Set sort parameter
 */
export function setSort(
  currentParams: Record<string, string | string[] | undefined>,
  sortValue: string
): Record<string, string | string[] | undefined> {
  // Remove both sort and sortBy if clearing
  if (!sortValue || sortValue === "featured") {
    const { sort: _, sortBy: __, ...rest } = currentParams;
    return rest;
  }
  
  // Remove sortBy if present
  const { sortBy: _, ...rest } = currentParams;
  
  return {
    ...rest,
    sort: sortValue,
  };
}

/**
 * Clear all filters
 */
export function clearFilters(
  currentParams: Record<string, string | string[] | undefined>
): Record<string, string | string[] | undefined> {
  const { gender, size, color, brand, category, price, sort, ...rest } = currentParams;
  return rest;
}

/**
 * Build query string from filter params
 */
export function buildQueryString(params: Record<string, string | string[] | undefined>): string {
  // Remove undefined values and empty arrays
  const cleaned: Record<string, string | string[]> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    cleaned[key] = value;
  }
  
  return queryString.stringify(cleaned, { arrayFormat: "bracket" });
}

/**
 * Check if a filter is active
 */
export function isFilterActive(
  filters: FilterParams,
  filterKey: keyof FilterParams,
  value: string
): boolean {
  const filterArray = filters[filterKey];
  if (!filterArray) return false;
  return Array.isArray(filterArray) ? filterArray.includes(value) : filterArray === value;
}


