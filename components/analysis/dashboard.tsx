"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { analysisApi, exportUrls } from "@/lib/api/client";
import { usePropertyFilters } from "@/lib/hooks/use-property-filters";
import { FilterBar } from "@/components/analysis/filter-bar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Property } from "@/types";

const COLUMNS: [keyof Property, string][] = [
  ["id", "ID"],
  ["squareFootage", "SqFt"],
  ["bedrooms", "Bed"],
  ["bathrooms", "Bath"],
  ["yearBuilt", "Year"],
  ["price", "Price"],
  ["schoolRating", "School"],
];

// Discrete grouping dimensions (continuous fields like yearBuilt/schoolRating
// would need bucketing first, so they are not offered here).
const GROUP_OPTIONS: { value: "bedrooms" | "bathrooms"; label: string }[] = [
  { value: "bedrooms", label: "Bedrooms" },
  { value: "bathrooms", label: "Bathrooms" },
];

export function Dashboard({ initialProperties }: { initialProperties: Property[] }) {
  const { data: properties = initialProperties } = useQuery({
    queryKey: ["properties"],
    queryFn: analysisApi.listProperties,
    initialData: initialProperties,
  });

  const { setFilters, filtered, clear } = usePropertyFilters(properties);

  const [sort, setSort] = useState<{ key: keyof Property; dir: "asc" | "desc" }>({
    key: "price",
    dir: "desc",
  });

  const [groupBy, setGroupBy] = useState<"bedrooms" | "bathrooms">("bedrooms");

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const va = a[sort.key];
      const vb = b[sort.key];
      if (typeof va === "number" && typeof vb === "number") {
        return sort.dir === "asc" ? va - vb : vb - va;
      }
      return 0;
    });
    return copy;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = useMemo(
    () => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sorted, page],
  );

  // Charts derive from the same filtered slice as the table, so they stay in
  // sync with the filters. Recomputing on 50 rows is effectively free.
  const segmentData = useMemo(() => {
    const groups = new Map<number, { sum: number; count: number }>();
    for (const p of filtered) {
      const key = p[groupBy];
      const entry = groups.get(key) ?? { sum: 0, count: 0 };
      entry.sum += p.price;
      entry.count += 1;
      groups.set(key, entry);
    }
    return [...groups.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([key, { sum, count }]) => ({
        name: String(key),
        avgPrice: Math.round(sum / count),
      }));
  }, [filtered, groupBy]);

  const distributionData = useMemo(() => {
    const bins = 8;
    if (filtered.length === 0) return [];
    const min = Math.min(...filtered.map((p) => p.price));
    const max = Math.max(...filtered.map((p) => p.price));
    const width = (max - min) / bins;
    const counts = new Array(bins).fill(0);
    for (const p of filtered) {
      const idx = Math.min(bins - 1, Math.floor((p.price - min) / width));
      counts[idx] += 1;
    }
    return counts.map((count, i) => {
      const lower = min + i * width;
      const upper = min + (i + 1) * width;
      return {
        // Label each bar as a price range, not a single point.
        name: `${Math.round(lower / 1000)}–${Math.round(upper / 1000)}k`,
        count,
      };
    });
  }, [filtered]);

  const toggleSort = (key: keyof Property) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" },
    );

  const sortIndicator = (key: keyof Property) =>
    sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="space-y-6">
      <FilterBar
        onApply={(filters) => {
          setFilters(filters);
          setPage(1);
        }}
        onClear={() => {
          clear();
          setPage(1);
        }}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Price Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-30}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--chart-2)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Avg Price</CardTitle>
              <Select
                value={groupBy}
                onValueChange={(v) => setGroupBy(v as "bedrooms" | "bathrooms")}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgPrice" fill="var(--chart-3)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map(([key, label]) => (
                <TableHead
                  key={key}
                  onClick={() => toggleSort(key)}
                  className="cursor-pointer select-none"
                >
                  {label}
                  {sortIndicator(key)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.squareFootage}</TableCell>
                <TableCell>{p.bedrooms}</TableCell>
                <TableCell>{p.bathrooms}</TableCell>
                <TableCell>{p.yearBuilt}</TableCell>
                <TableCell>${p.price.toLocaleString()}</TableCell>
                <TableCell>{p.schoolRating}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {sorted.length} properties
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <a href={exportUrls.csv}>Export CSV</a>
        </Button>
        <Button variant="outline" asChild>
          <a href={exportUrls.pdf}>Export PDF</a>
        </Button>
      </div>
    </div>
  );
}
