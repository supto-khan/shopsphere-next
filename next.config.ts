import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${BACKEND_URL}/storage/:path*`,
      },
      {
        source: "/public/assets/:path*",
        destination: `${BACKEND_URL}/public/assets/:path*`,
      },
      {
        source: "/assets/:path*",
        destination: `${BACKEND_URL}/assets/:path*`,
      },
    ];
  },
};

export default nextConfig;
