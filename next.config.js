/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Serve originals (no AVIF/WebP transcode). Safari was failing to decode the
    // optimizer's output; Sanity images are already CDN-optimized and local
    // assets are small, so this renders reliably across all browsers + Cloudflare.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *',
          },
        ],
      },
    ];
  },
  // Remove ANY of these if present - they break OpenNext CSS:
  // output: 'export'
  // experimental: { optimizeCss: true }
  // distDir
};

export default nextConfig;
