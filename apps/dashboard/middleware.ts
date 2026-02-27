// apps/dashboard/middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// Le matcher définit sur quelles routes le middleware doit s'exécuter.
// On exclut les fichiers statiques, les images, etc., pour des raisons de performance.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}