// apps/dashboard/app/showme.js/route.ts
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // 1. Calcul du chemin absolu vers le fichier compilé par Vite
    // process.cwd() se trouve dans apps/dashboard, on remonte de deux crans pour aller dans packages
    const filePath = path.join(process.cwd(), '../../packages/widget/dist/showme.js')
    
    // 2. Lecture du fichier en mémoire brute
    const fileContent = fs.readFileSync(filePath, 'utf-8')

    // 3. Distribution avec des en-têtes HTTP ultra-stricts (Le standard SaaS)
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Access-Control-Allow-Origin': '*', // Indispensable pour que n'importe quel site puisse le télécharger
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400', // Mise en cache agressive (CDN Edge)
      },
    })
  } catch (error) {
    console.error("[ShowMe] Erreur critique : Impossible de distribuer le widget.", error)
    return new NextResponse("Widget core not found. System offline.", { status: 404 })
  }
}