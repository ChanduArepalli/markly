import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'markly.chanduarepalli.com',
      },
      {
        protocol: 'https',
        hostname: 'api-markly.chanduarepalli.com',
      },
    ],
  },
};

export default nextConfig;
