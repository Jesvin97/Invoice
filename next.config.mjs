/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/invoice',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
