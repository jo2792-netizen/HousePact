import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false, // hide the Next.js badge so it doesn't show during class demos
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
