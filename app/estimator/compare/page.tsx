"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { estimatorApi } from "@/lib/api/client";
import { defaultValues, type PropertyFormValues } from "@/lib/validators/estimator";
import type { Estimate } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const FEATURE_LABELS: [keyof PropertyFormValues, string][] = [
  ["square_footage", "Square Footage"],
  ["bedrooms", "Bedrooms"],
  ["bathrooms", "Bathrooms"],
  ["year_built", "Year Built"],
  ["lot_size", "Lot Size"],
  ["distance_to_city_center", "Distance"],
  ["school_rating", "School Rating"],
];

export default function ComparePage() {
  const [properties, setProperties] = useState<PropertyFormValues[]>([
    defaultValues,
  ]);
  const [results, setResults] = useState<Estimate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const compareMutation = useMutation({
    mutationFn: (features: PropertyFormValues[]) =>
      estimatorApi.batchEstimate(features),
    onSuccess: (data) => {
      setResults(data.estimates);
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
    },
    onError: (err) =>
      setError(err instanceof Error ? err.message : "Comparison failed"),
  });

  const addProperty = () => setProperties((prev) => [...prev, defaultValues]);

  const updateProperty = (
    index: number,
    field: keyof PropertyFormValues,
    value: number,
  ) => {
    setProperties((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const runComparison = () => {
    setError(null);
    compareMutation.mutate(properties);
  };

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={addProperty}>
          + Add Property
        </Button>
        <Button onClick={runComparison} disabled={compareMutation.isPending}>
          {compareMutation.isPending ? "Comparing…" : "Compare"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feature</TableHead>
              {properties.map((_, i) => (
                <TableHead key={i}>
                  Property {String.fromCharCode(65 + i)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {FEATURE_LABELS.map(([field, label]) => (
              <TableRow key={field}>
                <TableCell className="text-muted-foreground">{label}</TableCell>
                {properties.map((p, i) => (
                  <TableCell key={i}>
                    <Input
                      type="number"
                      step="any"
                      value={p[field]}
                      onChange={(e) =>
                        updateProperty(i, field, Number(e.target.value))
                      }
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow className="bg-muted/50">
              <TableCell className="font-medium">Est. Price</TableCell>
              {properties.map((_, i) => (
                <TableCell key={i} className="font-semibold">
                  {results[i]
                    ? `$${results[i].prediction.toLocaleString()}`
                    : "—"}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
