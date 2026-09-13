import { execSync } from "node:child_process";
import type { NextConfig } from "next";

// The footer shows which build is running. Jenkins passes GIT_SHA and BUILD_TIME into the image
// build; a local build falls back to the working tree's commit.
function gitSha() {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "dev";
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_BUILD_SHA: process.env.GIT_SHA || gitSha(),
    NEXT_PUBLIC_BUILD_TIME: process.env.BUILD_TIME || new Date().toISOString(),
  },
  devIndicators: {
    // @ts-expect-error - Next.js 15 option
    appIsrStatus: false,
    buildActivity: false,
  },
};

export default nextConfig;
