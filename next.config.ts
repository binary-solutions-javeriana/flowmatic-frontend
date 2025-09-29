import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  server: {
    port: 4000,
  },
  experimental: {
    styledComponents: true,
  },
};

export default nextConfig;
