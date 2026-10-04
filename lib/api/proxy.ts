// Forwards a request from the browser to a backend service. Backends are
// ClusterIP services, so the browser reaches them through this server.

export async function proxy(
  request: Request,
  path: string[],
  backendUrl: string,
): Promise<Response> {
  const url = new URL(request.url);

  // Rebuild the target URL, preserving any query string.
  const target = new URL(`${backendUrl}/${path.join("/")}`);
  url.searchParams.forEach((value, key) => target.searchParams.append(key, value));

  const headers = new Headers(request.headers);
  headers.delete("host"); // let fetch set the correct Host for the backend

  let body: BodyInit | null = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.arrayBuffer();
  }

  try {
    const upstream = await fetch(target.toString(), {
      method: request.method,
      headers,
      body,
      // Forward the response body verbatim (JSON, CSV, PDF, ...).
      redirect: "manual",
    });

    const responseHeaders = new Headers(upstream.headers);
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error(`[proxy] failed to reach ${target.host}:`, err);
    return Response.json(
      { detail: "Backend service unavailable" },
      { status: 503 },
    );
  }
}
