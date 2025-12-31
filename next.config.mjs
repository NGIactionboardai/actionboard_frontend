/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },

  reactStrictMode: false,

  experimental: {
    optimizeCss: false,
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.txt$/,
      type: 'asset/source', // 🔐 preserves text EXACTLY
    });

    return config;
  },
};

export default nextConfig;
