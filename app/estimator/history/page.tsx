"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { estimatorApi } from "@/lib/api/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["estimates"],
    queryFn: () => estimatorApi.listEstimates(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => estimatorApi.deleteEstimate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
    },
    onError: (err) =>
      setError(err instanceof Error ? err.message : "Delete failed"),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }
  if (isError) return <p className="text-sm text-destructive">Failed to load history</p>;

  const estimates = data?.estimates ?? [];

  if (estimates.length === 0) {
    return <p className="text-sm text-muted-foreground">No estimates yet.</p>;
  }

  return (
    <div className="page-enter space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Prediction</TableHead>
              <TableHead>Bedrooms</TableHead>
              <TableHead>Square Ft</TableHead>
              <TableHead className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {estimates.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="text-muted-foreground">
                  {new Date(e.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="font-medium">
                  ${e.prediction.toLocaleString()}
                </TableCell>
                <TableCell>{e.inputs.bedrooms}</TableCell>
                <TableCell>{e.inputs.square_footage}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(e.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
