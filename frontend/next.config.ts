import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["img.clerk.com"],
  },
};

export default nextConfig;
