// apps/dashboard/next.config.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// En ESM, __dirname n'existe pas, on doit le recréer proprement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Indispensable pour le déploiement sur Vercel/Docker
  output: 'standalone', 
  
  experimental: {
    // On autorise Next.js à tracer les fichiers jusqu'à la racine du monorepo
    // Cela permet d'accéder à /packages/widget/dist depuis le dashboard
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
};

export default nextConfig;