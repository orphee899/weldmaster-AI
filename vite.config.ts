import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement depuis .env.local
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    base: '/weldmaster-AI/',
    define: {
      // Cette ligne est MAGIQUE : elle remplace "process.env.API_KEY" par ta vraie clé lors de la construction
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    }
  }
})