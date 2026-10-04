import { z } from "zod";

export const propertySchema = z.object({
  square_footage: z.coerce.number().positive().max(100_000),
  bedrooms: z.coerce.number().int().min(0).max(20),
  bathrooms: z.coerce.number().min(0).max(20),
  year_built: z.coerce.number().int().min(1800).max(2026),
  lot_size: z.coerce.number().positive().max(1_000_000),
  distance_to_city_center: z.coerce.number().min(0).max(1000),
  school_rating: z.coerce.number().min(0).max(10),
});

export type PropertyFormInput = z.input<typeof propertySchema>;
export type PropertyFormValues = z.output<typeof propertySchema>;

export const defaultValues: PropertyFormValues = {
  square_footage: 1850,
  bedrooms: 3,
  bathrooms: 2,
  year_built: 1998,
  lot_size: 7500,
  distance_to_city_center: 5.6,
  school_rating: 8.2,
};
