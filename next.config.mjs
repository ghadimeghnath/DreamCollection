/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dcwlvb4kb/image/upload/**',
      },
    ],
  },
};

export default nextConfig;
