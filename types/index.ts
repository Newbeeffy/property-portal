// Shared TypeScript types matching the two backend services' contracts.

/** A single property's features (matches Task 1/2 field names). */
export interface PropertyFeatures {
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
  distance_to_city_center: number;
  school_rating: number;
}

/** A persisted estimate returned by the estimator service. */
export interface Estimate {
  id: string;
  inputs: PropertyFeatures;
  prediction: number;
  created_at: string;
}

/** Raw property row from the analysis service's dataset. */
export interface Property {
  id: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  lotSize: number;
  distanceToCityCenter: number;
  schoolRating: number;
  price: number;
}

/** A grouped-statistics segment. */
export interface Segment {
  key: string;
  count: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}

export interface SegmentsResponse {
  groupBy: string;
  segments: Segment[];
}

/** A histogram bucket. */
export interface PriceBucket {
  lowerBound: number;
  upperBound: number;
  count: number;
}

export interface PriceDistributionResponse {
  divisions: number;
  minPrice: number;
  maxPrice: number;
  buckets: PriceBucket[];
}

/** Marginal effect of one feature on price. */
export interface Coefficient {
  feature: string;
  coefficient: number;
}

export interface CoefficientsResponse {
  intercept: number;
  coefficients: Coefficient[];
}

/** Sensitivity scan request/response. */
export interface SensitivityRequest {
  baseline: Record<string, number>;
  variable: string;
  min: number;
  max: number;
  steps: number;
}

export interface SensitivityPoint {
  value: number;
  price: number;
}

export interface SensitivityResponse {
  variable: string;
  points: SensitivityPoint[];
}
