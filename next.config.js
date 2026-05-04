/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Remove ANY of these if present - they break OpenNext CSS:
  // output: 'export'
  // experimental: { optimizeCss: true }
  // distDir
};

export default nextConfig;
