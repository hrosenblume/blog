/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    'hunter2.ngrok.dev',
    '*.ngrok.dev',
    '*.ngrok-free.app',
  ],
}

module.exports = nextConfig

