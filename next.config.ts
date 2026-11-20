import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  experimental: {
    // Server Actions default to a 1 MB request body; PDF uploads need more.
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
