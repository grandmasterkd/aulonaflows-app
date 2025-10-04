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
        source: '/profiles/:path*',
        destination: 'https://tkcsjgfgeeuumabatlnw.supabase.co/storage/v1/object/public/uploads/profiles/:path*',
      },
      {
        source: '/events/:path*',
        destination: 'https://tkcsjgfgeeuumabatlnw.supabase.co/storage/v1/object/public/uploads/events/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/profiles/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
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
