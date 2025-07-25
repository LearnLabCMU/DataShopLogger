/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/datashop-proxy',
        destination: 'https://pslc-qa.andrew.cmu.edu/log/server',
      },
    ]
  },
}

module.exports = nextConfig