"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  propertySchema,
  defaultValues,
  type PropertyFormInput,
  type PropertyFormValues,
} from "@/lib/validators/estimator";
import { estimatorApi } from "@/lib/api/client";
import type { Estimate } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fields: { name: keyof PropertyFormValues; label: string }[] = [
  { name: "square_footage", label: "Square Footage" },
  { name: "bedrooms", label: "Bedrooms" },
  { name: "bathrooms", label: "Bathrooms" },
  { name: "year_built", label: "Year Built" },
  { name: "lot_size", label: "Lot Size" },
  { name: "distance_to_city_center", label: "Distance to City Center" },
  { name: "school_rating", label: "School Rating" },
];

export function PropertyForm({
  onResult,
}: {
  onResult: (estimate: Estimate) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormInput, any, PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues,
  });

  const onSubmit = async (values: PropertyFormValues) => {
    setError(null);
    try {
      const estimate = await estimatorApi.createEstimate(values);
      onResult(estimate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1.5">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type="number"
              step="any"
              aria-invalid={!!errors[field.name]}
              {...register(field.name)}
            />
            {errors[field.name] && (
              <p className="text-sm text-destructive">
                {errors[field.name]?.message}
              </p>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Estimating…" : "Estimate Value"}
      </Button>
    </form>
  );
}
