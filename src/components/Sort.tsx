"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { setSort, buildQueryString } from "@/lib/utils/query";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price (Low → High)" },
  { value: "price_desc", label: "Price (High → Low)" },
] as const;

export function Sort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Read sort parameter from URL
  // Map "latest" to "newest" for display, and handle "featured" as "newest"
  const sortParam = searchParams.get("sort") || searchParams.get("sortBy") || "";
  let currentSort: string;
  if (!sortParam || sortParam === "latest" || sortParam === "featured") {
    currentSort = "newest"; // Default to "newest" for display
  } else {
    currentSort = sortParam;
  }
  const currentLabel = sortOptions.find((opt) => opt.value === currentSort)?.label || "Newest";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSortChange = (value: string) => {
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
    
    // Keep the value as-is in URL - backend will map "newest" to "latest" via parseFilterParams
    const newParams = setSort(currentParams, value);
    const queryString = buildQueryString(newParams);
    
    // Reset to page 1 when sorting changes
    const { page, ...restParams } = newParams;
    const finalQueryString = buildQueryString(restParams);
    
    router.push(`${pathname}${finalQueryString ? `?${finalQueryString}` : ""}`, { scroll: false });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0 transition-colors"
        aria-expanded={isOpen ? "true" : "false"}
        aria-haspopup="listbox"
      >
        <span className="text-sm font-medium text-gray-700">Sort By:</span>
        <span className="text-sm text-gray-900">{currentLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <ul
            role="listbox"
            className="py-1"
            aria-label="Sort options"
          >
            {sortOptions.map((option) => {
              const isSelected = currentSort === option.value;
              return (
                <li 
                  key={option.value} 
                  role="option"
                  aria-selected={isSelected ? "true" : "false"}
                >
                  <button
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                      isSelected
                        ? "bg-gray-50 font-medium text-black"
                        : "text-gray-700"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}


