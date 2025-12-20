"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { Filters } from "./Filters";

export function MobileFilterToggle() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black transition-colors"
        aria-label="Open filters"
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filters</span>
      </button>

      <Filters isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}


