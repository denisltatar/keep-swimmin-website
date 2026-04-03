import type { NextConfig } from "next";

/** GitHub Pages project URL; omit in dev so http://localhost:3000/ works. */
const basePath = process.env.NODE_ENV === "production" ? "/keep-swimmin-website" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
