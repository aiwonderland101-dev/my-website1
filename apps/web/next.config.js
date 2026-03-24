/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  allowedDevOrigins: ["*.replit.dev", "*.kirk.replit.dev", "*.janeway.replit.dev", "*.worf.replit.dev", "*.repl.co"],

  experimental: {
    externalDir: false,
  },

  turbopack: {},

  transpilePackages: ["@react-three/fiber", "@react-three/drei", "three"],

  images: {
    unoptimized: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // WebGL & Heavy Module Configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side: Increase memory for WebGL
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Separate vendor chunk
            vendor: {
              filename: 'chunks/vendor.js',
              test: /node_modules/,
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Separate WebGL libraries
            webgl: {
              filename: 'chunks/webgl.js',
              test: /[\\/]node_modules[\\/](three|@react-three|babylon[\\/])?/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // Separate Puck editor
            puck: {
              filename: 'chunks/puck.js',
              test: /[\\/]node_modules[\\/]@measured[\\/]puck/,
              priority: 20,
              reuseExistingChunk: true,
            },
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // Handle raw shader files
    config.module.rules.push({
      test: /\.(glsl|vs|fs)$/,
      type: 'asset/source',
    });

    return config;
  },

  // Headers for WebGL & Cross-Origin
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      ],
    },
  ],
};

module.exports = nextConfig;
