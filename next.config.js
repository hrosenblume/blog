/** @type {import('next').NextConfig} */
// Trigger redeploy
const nextConfig = {
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    'hunter2.ngrok.dev',
    '*.ngrok.dev',
    '*.ngrok-free.app',
    '192.168.68.*',
  ],
}

module.exports = nextConfig

