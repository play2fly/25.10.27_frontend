import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", 빌드할때 사용함 정적모드 시발 개새
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
