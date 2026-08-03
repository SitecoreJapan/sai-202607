/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  async rewrites() {
    return [
      {
        source: "/demo2/:path*",
        destination: "https://xmc-demo-20250930-test-demo2.vercel.app/:path*",
      },
      {
        source: "/ootbbasic/:path*",
        destination:
          "https://xmc-demo-preview202605-ootbbasicsit.vercel.app/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
