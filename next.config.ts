import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rendering strategy — choose based on data nature:
  // 1. SSG (static): output: "export" — for static/rarely-changing data (default)
  // 2. ISR: remove output: "export", use revalidate in page components
  // 3. Hybrid: remove output: "export", mix static + dynamic routes
  output: "export",
};

export default nextConfig;
