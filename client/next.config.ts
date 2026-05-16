import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: '..',
  },
  serverExternalPackages: ['qrcode'],
};

export default nextConfig;
