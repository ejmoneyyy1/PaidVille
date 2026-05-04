/** @type {import('next').NextConfig} */
const nextConfig = {
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
