import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Improve hot reload stability
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Optimize chunks for better hot reload
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          cacheGroups: {
            ...config.optimization?.splitChunks?.cacheGroups,
            default: false,
            vendors: false,
            // Create a separate chunk for react-spring to prevent reload issues
            reactSpring: {
              name: 'react-spring',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]@react-spring[\\/]/,
              enforce: true,
            },
          },
        },
      };
    }
    return config;
  },
  
  // Disable experimental features that can cause issues
  experimental: {
    optimizePackageImports: ['@react-spring/web'],
  },
};

export default nextConfig;
