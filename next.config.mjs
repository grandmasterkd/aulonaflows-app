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
        source: '/(.*)',
        headers: [
         {
  key: 'Content-Security-Policy',
  value: `
    default-src 'self';
    script-src
      'self'
      'unsafe-inline'
      'unsafe-eval'
      https://js.stripe.com
      https://m.stripe.com
      https://va.vercel-scripts.com;
    style-src
      'self'
      'unsafe-inline';
    connect-src
      'self'
      https://api.stripe.com
      https://m.stripe.network
      https://m.stripe.com
      https://stripe.com
      https://tkcsjgfgeeuumabatlnw.supabase.co;
    frame-src
      'self'
      https://js.stripe.com
      https://m.stripe.com
      https://hooks.stripe.com;
    img-src
      'self'
      data:
      https://*.stripe.com
      https://stripe.com
      https://tkcsjgfgeeuumabatlnw.supabase.co
      https://media.aulonaflows.com;
  `.replace(/\s{2,}/g, ' ').trim(),
}
        ],
      },
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
