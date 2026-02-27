/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    output: 'standalone', // Optionnel mais recommandé
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  }
    },
  },
};

export default nextConfig;