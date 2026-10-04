import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server (server.js + minimal deps) for the Docker run
  // stage, instead of shipping the whole node_modules tree.
  output: "standalone",
};

export default nextConfig;
