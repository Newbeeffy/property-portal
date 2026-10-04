import { proxy } from "@/lib/api/proxy";

const BACKEND = process.env.ANALYSIS_BACKEND_URL ?? "http://property-market-analysis-svc";

export async function GET(request: Request, ctx: RouteContext<"/api/analysis/[...path]">) {
  const { path } = await ctx.params;
  return proxy(request, path, BACKEND);
}

export async function POST(request: Request, ctx: RouteContext<"/api/analysis/[...path]">) {
  const { path } = await ctx.params;
  return proxy(request, path, BACKEND);
}
