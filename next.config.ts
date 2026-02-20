import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: {
    // @ts-ignore - Next.js 15 option
    appIsrStatus: false,
    buildActivity: false,
  },
};

export default nextConfig;
