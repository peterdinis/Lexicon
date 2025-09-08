import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
        port: "",
        pathname: "/**",
      },
    ],
  },
  typedRoutes: true,
  experimental: {
    browserDebugInfoInTerminal: true,
    devtoolSegmentExplorer: true,
  },
};

export default nextConfig;
