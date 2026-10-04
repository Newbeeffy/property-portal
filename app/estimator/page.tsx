"use client";

import { PropertyForm } from "@/components/estimator/property-form";
import { ResultPanel } from "@/components/estimator/result-panel";
import type { Estimate } from "@/types";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function EstimatorPage() {
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const queryClient = useQueryClient();

  const handleResult = (e: Estimate) => {
    setEstimate(e);
    // A new estimate is now in the history; invalidate the cached list so the
    // history page refetches instead of showing a stale snapshot.
    queryClient.invalidateQueries({ queryKey: ["estimates"] });
  };

  return (
    <div className="page-enter grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-md border p-6">
        <h2 className="mb-4 text-base font-semibold">Property Details</h2>
        <PropertyForm onResult={handleResult} />
      </section>

      <section className="rounded-md border p-6">
        <h2 className="mb-4 text-base font-semibold">Result</h2>
        {estimate ? (
          <ResultPanel estimate={estimate} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Submit the form to see the estimated price.
          </p>
        )}
      </section>
    </div>
  );
}
