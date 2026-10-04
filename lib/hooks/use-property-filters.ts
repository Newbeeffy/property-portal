"use client";

import { useMemo, useState } from "react";
import type { Property } from "@/types";

export interface PropertyFilters {
  bedrooms: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  minSqFt: number | null;
  maxSqFt: number | null;
  minSchoolRating: number | null;
}

const emptyFilters: PropertyFilters = {
  bedrooms: null,
  minPrice: null,
  maxPrice: null,
  minSqFt: null,
  maxSqFt: null,
  minSchoolRating: null,
};

// Shared filter state so the data table and the charts reflect the same slice.
export function usePropertyFilters(all: Property[]) {
  const [filters, setFilters] = useState<PropertyFilters>(emptyFilters);

  const filtered = useMemo(() => {
    return all.filter((p) => {
      return (
        (filters.bedrooms == null || p.bedrooms === filters.bedrooms) &&
        (filters.minPrice == null || p.price >= filters.minPrice) &&
        (filters.maxPrice == null || p.price <= filters.maxPrice) &&
        (filters.minSqFt == null || p.squareFootage >= filters.minSqFt) &&
        (filters.maxSqFt == null || p.squareFootage <= filters.maxSqFt) &&
        (filters.minSchoolRating == null || p.schoolRating >= filters.minSchoolRating)
      );
    });
  }, [all, filters]);

  const clear = () => setFilters(emptyFilters);

  return { filters, setFilters, filtered, clear };
}
