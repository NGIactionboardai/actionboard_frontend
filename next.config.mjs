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
    }
  };

export default nextConfig;
