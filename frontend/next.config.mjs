/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // Use in-memory cache to eliminate Windows file-locking ENOENT .pack.gz cache warnings
      config.cache = false;
    }
    return config;
  },
  async rewrites() {
    const backendHost = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000")
      .replace(/\/api\/v1\/?$/, "")
      .replace(/\/$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${backendHost}/api/:path*`,
      },
      {
        source: "/receipts-pdf/:path*",
        destination: `${backendHost}/receipts-pdf/:path*`,
      },
    ];
  },
};

export default nextConfig;
