import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'is*-ssl.mzstatic.com',
      },
      {
        protocol: 'https',
        hostname: '*.mzstatic.com',
      },
      {
        protocol: 'https',
        hostname: '*.apple.com',
      },
      {
        protocol: 'https',
        hostname: 'images.shazam.com',
      }
    ],
  },
};

export default nextConfig;
