/** @type {import('next').NextConfig} */
const cases = ["enterprise-search", "adeo", "ai-agent", "hdfc", "sony"];

export default {
  images: { formats: ["image/webp"], minimumCacheTTL: 31536000 },
  async headers() {
    return [{ source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=31536000" }] }];
  },
  // Keep old Framer URLs working so existing links (resume, LinkedIn, emails) don't break.
  async redirects() {
    return [
      { source: "/about-2", destination: "/about", permanent: true },
      ...cases.map((slug) => ({ source: `/${slug}`, destination: `/work/${slug}`, permanent: true })),
    ];
  },
};
