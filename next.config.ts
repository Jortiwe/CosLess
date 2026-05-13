import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "ae-pic-a1.aliexpress-media.com",
      },
      {
        protocol: "https",
        hostname: "ae01.alicdn.com",
      },
      {
        protocol: "https",
        hostname: "instagram.fcbb3-1.fna.fbcdn.net",
      },
    ],
  },
};

export default nextConfig;