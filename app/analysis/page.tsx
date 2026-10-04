import { Dashboard } from "@/components/analysis/dashboard";
import type { Property } from "@/types";

export const dynamic = "force-dynamic";

const BACKEND = process.env.ANALYSIS_BACKEND_URL ?? "http://property-market-analysis-svc";

async function loadProperties(): Promise<Property[]> {
  try {
    const res = await fetch(`${BACKEND}/properties`);
    if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    return res.json();
  } catch (err) {
    console.error("[analysis] failed to load properties:", err);
    return [];
  }
}

export default async function AnalysisPage() {
  const properties = await loadProperties();

  return (
    <div className="page-enter">
      <Dashboard initialProperties={properties} />
    </div>
  );
}
