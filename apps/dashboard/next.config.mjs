// apps/dashboard/next.config.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', 
  
  // Limite pour le Edge Middleware
  middlewareClientMaxBodySize: '50mb',

  experimental: {
    // Le parseur multipart doit être configuré ici
    serverActions: {
      bodySizeLimit: '50mb',
    },
    // Conservation du tracing pour le monorepo Vercel
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
};

export default nextConfig;