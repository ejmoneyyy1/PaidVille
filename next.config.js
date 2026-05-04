/** @type {import('next').NextConfig} */
const nextConfig = {
  // Default Next.js output is suitable for SSR / OpenNext — do not set `output: 'export'`.
  experimental: {
    // Avoid critters-based CSS optimization issues on Cloudflare workerd (unstyled HTML).
    optimizeCss: false,
  },
  images: {
    remotePatterns: [
      {protocol: 'https', hostname: 'cdn.sanity.io'},
      {protocol: 'https', hostname: 'images.unsplash.com'},
    ],
  },
};

if (process.env.NODE_ENV === 'development') {
  try {
    const {initOpenNextCloudflareForDev} = require('@opennextjs/cloudflare');
    initOpenNextCloudflareForDev();
  } catch {
    // optional during install before @opennextjs/cloudflare is present
  }
}

module.exports = nextConfig;
