// apps/dashboard/components/CopyButton.tsx
'use client'

import { useState } from 'react'

interface CopyButtonProps {
  textToCopy: string
}

export default function CopyButton({ textToCopy }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      setIsCopied(true)
      
      // Remise à zéro du bouton après 2 secondes
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (err) {
      console.error("[ShowMe] Échec de la copie dans le presse-papiers :", err)
    }
  }

  return (
    <button 
      onClick={handleCopy}
      className={`px-4 py-4 rounded-lg text-sm font-medium transition-colors border ${
        isCopied 
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
      }`}
    >
      {isCopied ? 'Copié !' : 'Copier'}
    </button>
  )
}