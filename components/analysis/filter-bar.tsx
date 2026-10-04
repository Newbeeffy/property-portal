"use client";

import { useState } from "react";
import type { PropertyFilters } from "@/lib/hooks/use-property-filters";
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

const bedroomOptions = [2, 3, 4];

const empty: PropertyFilters = {
  bedrooms: null,
  minPrice: null,
  maxPrice: null,
  minSqFt: null,
  maxSqFt: null,
  minSchoolRating: null,
};

export function FilterBar({
  onApply,
  onClear,
}: {
  onApply: (filters: PropertyFilters) => void;
  onClear: () => void;
}) {
  const [draft, setDraft] = useState<PropertyFilters>(empty);

  const set = <K extends keyof PropertyFilters>(
    key: K,
    value: PropertyFilters[K],
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-md border bg-muted/30 p-4">
      <div className="flex flex-col gap-1.5">
        <Label>Bedrooms</Label>
        <Select
          value={draft.bedrooms == null ? "all" : String(draft.bedrooms)}
          onValueChange={(v) =>
            set("bedrooms", v === "all" ? null : Number(v))
          }
        >
          <SelectTrigger className="w-28">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {bedroomOptions.map((b) => (
              <SelectItem key={b} value={String(b)}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Price range</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={draft.minPrice ?? ""}
            onChange={(e) =>
              set("minPrice", e.target.value ? Number(e.target.value) : null)
            }
            className="w-24"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={draft.maxPrice ?? ""}
            onChange={(e) =>
              set("maxPrice", e.target.value ? Number(e.target.value) : null)
            }
            className="w-24"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Square footage</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={draft.minSqFt ?? ""}
            onChange={(e) =>
              set("minSqFt", e.target.value ? Number(e.target.value) : null)
            }
            className="w-24"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={draft.maxSqFt ?? ""}
            onChange={(e) =>
              set("maxSqFt", e.target.value ? Number(e.target.value) : null)
            }
            className="w-24"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Min school rating</Label>
        <Input
          type="number"
          step="0.1"
          placeholder="e.g. 8"
          value={draft.minSchoolRating ?? ""}
          onChange={(e) =>
            set(
              "minSchoolRating",
              e.target.value ? Number(e.target.value) : null,
            )
          }
          className="w-28"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={() => onApply(draft)}>Apply</Button>
        <Button
          variant="outline"
          onClick={() => {
            setDraft(empty);
            onClear();
          }}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
