// apps/dashboard/app/showme.js/route.ts
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), '../../packages/widget/dist/showme.js')
    
    // Vérification de sécurité pour éviter le crash au build
    if (!fs.existsSync(filePath)) {
      console.warn("[ShowMe] Widget non trouvé au chemin :", filePath)
      return new NextResponse("Widget is compiling or not found.", { status: 503 })
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}