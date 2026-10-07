/** @type {import('next').NextConfig} */
const cases = ["enterprise-search", "adeo", "ai-agent", "hdfc", "sony"];

export default {
  // Keep old Framer URLs working so existing links (resume, LinkedIn, emails) don't break.
  async redirects() {
    return [
      { source: "/about-2", destination: "/about", permanent: true },
      ...cases.map((slug) => ({ source: `/${slug}`, destination: `/work/${slug}`, permanent: true })),
    ];
  },
};
