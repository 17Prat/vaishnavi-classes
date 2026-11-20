/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
      {
        source: "/receipts-pdf/:path*",
        destination: "http://127.0.0.1:8000/receipts-pdf/:path*",
      },
    ];
  },
};

export default nextConfig;
