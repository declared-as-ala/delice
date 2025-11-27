/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.sumup.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.notretemps.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cms-cdn.lafourche.fr',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lacorbeille-saintnazaire-epicerie.fr',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
