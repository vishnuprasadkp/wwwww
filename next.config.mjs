/** @type {import('next').NextConfig} */
const cases = ["enterprise-search", "adeo", "ai-agent", "hdfc", "sony"];

export default {
  async headers() {
    return [
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=31536000" }] },
      // Pre-built image files never change in place, so they can be cached for a year (listed last so it wins).
      { source: "/images/_opt/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
  // Keep old Framer URLs working so existing links (resume, LinkedIn, emails) don't break.
  async redirects() {
    return [
      { source: "/about-2", destination: "/about", permanent: true },
      ...cases.map((slug) => ({ source: `/${slug}`, destination: `/work/${slug}`, permanent: true })),
    ];
  },
};
