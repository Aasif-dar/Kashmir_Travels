import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  // The repository has more than one lockfile; pin the workspace root to this app.
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
