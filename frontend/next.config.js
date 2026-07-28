/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Standalone output creates a self-contained server.js for Docker production builds
    output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
    env: {
        API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
    },
}

module.exports = nextConfig
