const createNextIntlPlugin = require("next-intl/plugin");

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/my-company-4/backend/public/api";
const backendPublicBase = apiBase.endsWith("/api") ? apiBase.slice(0, -4) : apiBase;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/storage/:path*",
        destination: `${backendPublicBase}/storage/:path*`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

module.exports = withNextIntl(nextConfig);
