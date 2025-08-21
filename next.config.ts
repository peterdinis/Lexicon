import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	experimental: {
		viewTransition: true,
	},
	serverExternalPackages: ["yjs"],
};

export default nextConfig;
