import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: {
    // @ts-expect-error - Next.js 15 option
    appIsrStatus: false,
    buildActivity: false,
  },
};

export default nextConfig;
