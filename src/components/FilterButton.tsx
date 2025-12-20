"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { removeFilter, buildQueryString, type FilterParams } from "@/lib/utils/query";

interface FilterButtonProps {
  filterKey: keyof FilterParams;
  value: string;
  label: string;
}

export function FilterButton({ filterKey, value, label }: FilterButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleRemove = () => {
    // Properly parse current params with array support
    const currentParams: Record<string, string | string[]> = {};
    for (const [key, val] of searchParams.entries()) {
      const cleanKey = key.replace(/\[\]$/, '');
      if (currentParams[cleanKey]) {
        if (Array.isArray(currentParams[cleanKey])) {
          (currentParams[cleanKey] as string[]).push(val);
        } else {
          currentParams[cleanKey] = [currentParams[cleanKey] as string, val];
        }
      } else {
        const allValues = searchParams.getAll(key);
        currentParams[cleanKey] = allValues.length > 1 ? allValues : val;
      }
    }
    
    const newParams = removeFilter(currentParams, filterKey, value);
    const queryString = buildQueryString(newParams);
    
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
  };

  return (
    <button
      onClick={handleRemove}
      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-colors"
      aria-label={`Remove filter: ${label}`}
    >
      <span>{label}</span>
      <X className="w-3 h-3" />
    </button>
  );
}


