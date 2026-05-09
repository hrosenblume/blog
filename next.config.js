/** @type {import('next').NextConfig} */
// Trigger redeploy
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // jsdom (used by autoblogger) requires parse5, which is now ESM-only.
  // Mark them as server externals so Node resolves them at runtime with
  // native ESM/CJS interop instead of bundling through webpack.
  serverExternalPackages: ['jsdom', 'parse5'],
  allowedDevOrigins: [
    'hunter2.ngrok.dev',
    '*.ngrok.dev',
    '*.ngrok-free.app',
    '192.168.68.*',
  ],
}

module.exports = nextConfig

