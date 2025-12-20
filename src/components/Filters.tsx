"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import {
  parseFilters,
  toggleFilter,
  buildQueryString,
  isFilterActive,
  type FilterParams,
} from "@/lib/utils/query";

interface FilterGroup {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

const filterGroups: FilterGroup[] = [
  {
    id: "gender",
    label: "Gender",
    options: [
      { value: "men", label: "Men" },
      { value: "women", label: "Women" },
      { value: "unisex", label: "Unisex" },
    ],
  },
  {
    id: "size",
    label: "Size",
    options: [
      { value: "6", label: "6" },
      { value: "6-5", label: "6.5" },
      { value: "7", label: "7" },
      { value: "7-5", label: "7.5" },
      { value: "8", label: "8" },
      { value: "8-5", label: "8.5" },
      { value: "9", label: "9" },
      { value: "9-5", label: "9.5" },
      { value: "10", label: "10" },
      { value: "10-5", label: "10.5" },
      { value: "11", label: "11" },
      { value: "11-5", label: "11.5" },
      { value: "12", label: "12" },
    ],
  },
  {
    id: "color",
    label: "Color",
    options: [
      { value: "black", label: "Black" },
      { value: "white", label: "White" },
      { value: "red", label: "Red" },
      { value: "blue", label: "Blue" },
      { value: "gray", label: "Gray" },
      { value: "green", label: "Green" },
      { value: "orange", label: "Orange" },
      { value: "pink", label: "Pink" },
    ],
  },
  {
    id: "price",
    label: "Shop By Price",
    options: [
      { value: "25-50", label: "$25 - $50" },
      { value: "50-100", label: "$50 - $100" },
      { value: "100-150", label: "$100 - $150" },
      { value: "150+", label: "Over $150" },
    ],
  },
];

interface FiltersProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Filters({ isOpen = true, onClose }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(filterGroups.map((g) => g.id))
  );
  const [filters, setFilters] = useState<FilterParams>(() =>
    parseFilters(searchParams)
  );

  // Sync filters with URL changes (browser back/forward)
  useEffect(() => {
    setFilters(parseFilters(searchParams));
  }, [searchParams]);

  const handleFilterToggle = (filterKey: keyof FilterParams, value: string) => {
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
    
    const newParams = toggleFilter(currentParams, filterKey, value);
    const queryString = buildQueryString(newParams);
    
    // Shallow navigation
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const clearAllFilters = () => {
    router.push(pathname, { scroll: false });
  };

  const activeFiltersCount = [
    filters.gender?.length || 0,
    filters.size?.length || 0,
    filters.color?.length || 0,
    filters.price?.length || 0,
  ].reduce((a, b) => a + b, 0);

  const content = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:border-0 lg:pb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-600 hover:text-gray-900 underline focus:outline-none focus:ring-2 focus:ring-black rounded"
          >
            Clear all
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-black"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {filterGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.id);
          const groupFilters = filters[group.id as keyof FilterParams];
          const activeCount = Array.isArray(groupFilters) ? groupFilters.length : groupFilters ? 1 : 0;

          return (
            <div key={group.id} className="mb-4 border-b border-gray-200 last:border-0 pb-4">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between py-2 text-left focus:outline-none focus:ring-2 focus:ring-black rounded"
                aria-expanded={isExpanded ? "true" : "false"}
              >
                <span className="font-medium text-gray-900">
                  {group.label}
                  {activeCount > 0 && (
                    <span className="ml-2 text-sm text-gray-500">({activeCount})</span>
                  )}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {isExpanded && (
                <div className="mt-2 space-y-2">
                  {group.options.map((option) => {
                    const isActive = isFilterActive(filters, group.id as keyof FilterParams, option.value);
                    return (
                      <label
                        key={option.value}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded focus-within:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => handleFilterToggle(group.id as keyof FilterParams, option.value)}
                          className="w-4 h-4 text-black border-gray-300 rounded focus:ring-2 focus:ring-black focus:ring-offset-0"
                          aria-label={`Filter by ${option.label}`}
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Mobile drawer
  if (onClose) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}

        {/* Drawer */}
        <div
          className={`fixed left-0 top-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {content}
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-200 bg-white">
      {content}
    </aside>
  );
}


