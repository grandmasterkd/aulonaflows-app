/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.aulonaflows.com',
      },
      {
        protocol: 'https',
        hostname: 'tkcsjgfgeeuumabatlnw.supabase.co',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/events/:path*',
        destination: 'https://tkcsjgfgeeuumabatlnw.supabase.co/storage/v1/object/public/event-images/events/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/events/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
