"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { analysisApi } from "@/lib/api/client";
import { defaultValues, type PropertyFormValues } from "@/lib/validators/estimator";
import type { SensitivityResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FEATURES: [keyof PropertyFormValues, string][] = [
  ["square_footage", "Square Footage"],
  ["bedrooms", "Bedrooms"],
  ["bathrooms", "Bathrooms"],
  ["year_built", "Year Built"],
  ["lot_size", "Lot Size"],
  ["distance_to_city_center", "Distance to City Center"],
  ["school_rating", "School Rating"],
];

// Scan range and step unit per feature. `unit` is the smallest meaningful
// increment (e.g. 0.5 bathrooms, 5 years), used to derive a sensible step count.
const FEATURE_RANGES: Record<
  keyof PropertyFormValues,
  { min: number; max: number; unit: number }
> = {
  square_footage: { min: 800, max: 3000, unit: 100 },
  bedrooms: { min: 1, max: 6, unit: 1 },
  bathrooms: { min: 1, max: 5, unit: 0.5 },
  year_built: { min: 1960, max: 2025, unit: 5 },
  lot_size: { min: 3000, max: 15000, unit: 100 },
  distance_to_city_center: { min: 0, max: 15, unit: 0.1 },
  school_rating: { min: 0, max: 10, unit: 0.1 },
};

export default function WhatIfPage() {
  const [baseline, setBaseline] = useState<PropertyFormValues>(defaultValues);
  const [variable, setVariable] = useState<keyof PropertyFormValues>("square_footage");
  const [min, setMin] = useState(1000);
  const [max, setMax] = useState(3000);
  const [steps, setSteps] = useState(20);
  const [result, setResult] = useState<SensitivityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const { data: coefficients } = useQuery({
    queryKey: ["coefficients"],
    queryFn: analysisApi.coefficients,
  });

  const run = async () => {
    setError(null);
    setRunning(true);
    try {
      const resp = await analysisApi.sensitivity({
        baseline: baseline as Record<string, number>,
        variable,
        min,
        max,
        steps,
      });
      setResult(resp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setRunning(false);
    }
  };

  const chartData = (result?.points ?? []).map((p) => ({
    value: p.value,
    price: Math.round(p.price),
  }));

  return (
    <div className="page-enter grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Baseline Property</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map(([field, label]) => (
                <div key={field} className="flex flex-col gap-1.5">
                  <Label htmlFor={`baseline-${field}`}>{label}</Label>
                  <Input
                    id={`baseline-${field}`}
                    type="number"
                    step="any"
                    value={baseline[field]}
                    onChange={(e) =>
                      setBaseline((prev) => ({
                        ...prev,
                        [field]: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sensitivity Variables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Variable</Label>
                <Select
                  value={variable}
                  onValueChange={(v) => {
                    const next = v as keyof PropertyFormValues;
                    setVariable(next);
                    const range = FEATURE_RANGES[next];
                    setMin(range.min);
                    setMax(range.max);
                    setSteps(
                      Math.min(100, Math.round((range.max - range.min) / range.unit) + 1),
                    );
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FEATURES.map(([field, label]) => (
                      <SelectItem key={field} value={field}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="steps">Steps</Label>
                <Input
                  id="steps"
                  type="number"
                  min={2}
                  max={100}
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="min">Min</Label>
                <Input
                  id="min"
                  type="number"
                  step="any"
                  value={min}
                  onChange={(e) => setMin(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="max">Max</Label>
                <Input
                  id="max"
                  type="number"
                  step="any"
                  value={max}
                  onChange={(e) => setMax(Number(e.target.value))}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button onClick={run} disabled={running}>
              {running ? "Running…" : "Run Analysis"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sensitivity Curve</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="value"
                      tickFormatter={(v: number) => v.toFixed(2)}
                    />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="var(--chart-1)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Run an analysis to see the price curve.
              </p>
            )}
          </CardContent>
        </Card>

        {coefficients && (
          <Card>
            <CardHeader>
              <CardTitle>Feature Impact (marginal effect)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                {coefficients.coefficients.map((c) => (
                  <li key={c.feature} className="flex justify-between border-t py-1.5">
                    <span className="text-muted-foreground">{c.feature}</span>
                    <span className="font-medium">
                      ${Math.round(c.coefficient).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
