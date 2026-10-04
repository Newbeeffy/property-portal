import { proxy } from "@/lib/api/proxy";

const BACKEND = process.env.ESTIMATOR_BACKEND_URL ?? "http://property-value-estimator-svc";

export async function GET(request: Request, ctx: RouteContext<"/api/estimator/[...path]">) {
  const { path } = await ctx.params;
  return proxy(request, path, BACKEND);
}

export async function POST(request: Request, ctx: RouteContext<"/api/estimator/[...path]">) {
  const { path } = await ctx.params;
  return proxy(request, path, BACKEND);
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/estimator/[...path]">) {
  const { path } = await ctx.params;
  return proxy(request, path, BACKEND);
}
