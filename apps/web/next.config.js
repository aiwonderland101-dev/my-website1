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
};

module.exports = nextConfig;
