import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/unipago': {
          target: `${env.VITE_SENASA_BASE_URL}MedicamentosUnipago`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/unipago/, ''),
        },
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  }
})
