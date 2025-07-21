/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/photos/**',
      },
      {
        protocol: 'https',
        hostname: 'deckofcardsapi.com',
        pathname: '/static/img/**',
      },
    ],
  },
}

module.exports = nextConfig
