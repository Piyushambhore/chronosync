import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      // Expose VITE_PARTYKIT_HOST to the client bundle
      'import.meta.env.VITE_PARTYKIT_HOST': JSON.stringify(
        env.VITE_PARTYKIT_HOST || ''
      ),
    },
    server: {
      // Proxy /party/* requests to the local PartyKit dev server (port 1999)
      // This avoids CORS issues when running both servers in development
      proxy: {
        '/party': {
          target: `http://${env.VITE_PARTYKIT_HOST || 'localhost:1999'}`,
          changeOrigin: true,
          ws: true, // Also proxy WebSocket upgrades
        },
      },
    },
  }
})
