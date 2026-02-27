// packages/widget/vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      // Le point d'entrée de notre script
      entry: 'src/main.ts',
      // Le nom de la variable globale injectée sur le site client (window.ShowMe)
      name: 'ShowMe',
      // Le format désiré pour un widget intégré via balise <script>
      formats: ['iife'],
      // Le nom du fichier généré
      fileName: () => `showme.js`
    },
    // Désactiver le découpage de code pour tout avoir dans un seul fichier
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      }
    }
  }
})