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
  // two designs run side by side from one tree (DESIGN=pixel on :3000, DESIGN=particle on :3001);
  // each dev server needs its own build directory or they trample each other's cache
  distDir: process.env.NEXT_DIST_DIR || ".next",
  env: {
    NEXT_PUBLIC_BUILD_SHA: process.env.GIT_SHA || gitSha(),
    NEXT_PUBLIC_BUILD_TIME: process.env.BUILD_TIME || new Date().toISOString(),
  },
  // no dev overlay badge in the corner (Next 16 takes false; appIsrStatus/buildActivity were removed)
  devIndicators: false,
};

export default nextConfig;
