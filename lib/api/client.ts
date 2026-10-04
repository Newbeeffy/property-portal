// Type-safe fetch wrappers for the two backend services (via the BFF proxy).

import type {
  CoefficientsResponse,
  Estimate,
  PriceDistributionResponse,
  Property,
  PropertyFeatures,
  SegmentsResponse,
  SensitivityRequest,
  SensitivityResponse,
} from "@/types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(detail);
  }

  // 204 No Content has no body to parse (e.g. DELETE).
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// --- Estimator service ---

export const estimatorApi = {
  createEstimate: (features: PropertyFeatures) =>
    request<Estimate>("/api/estimator/estimates", {
      method: "POST",
      body: JSON.stringify(features),
    }),

  batchEstimate: (features: PropertyFeatures[]) =>
    request<{ estimates: Estimate[] }>("/api/estimator/estimates/batch", {
      method: "POST",
      body: JSON.stringify(features),
    }),

  listEstimates: (limit = 100) =>
    request<{ estimates: Estimate[] }>(`/api/estimator/estimates?limit=${limit}`),

  deleteEstimate: (id: string) =>
    request<void>(`/api/estimator/estimates/${id}`, { method: "DELETE" }),
};

// --- Analysis service ---

export const analysisApi = {
  listProperties: () => request<Property[]>("/api/analysis/properties"),

  segments: (groupBy: string) =>
    request<SegmentsResponse>(`/api/analysis/market/segments?groupBy=${groupBy}`),

  priceDistribution: (divisions = 10) =>
    request<PriceDistributionResponse>(
      `/api/analysis/market/price-distribution?divisions=${divisions}`,
    ),

  coefficients: () =>
    request<CoefficientsResponse>("/api/analysis/market/what-if/coefficients"),

  sensitivity: (req: SensitivityRequest) =>
    request<SensitivityResponse>("/api/analysis/market/what-if/sensitivity", {
      method: "POST",
      body: JSON.stringify(req),
    }),
};

/** Direct download links for exports. */
export const exportUrls = {
  csv: "/api/analysis/export/csv",
  pdf: "/api/analysis/export/pdf",
};
