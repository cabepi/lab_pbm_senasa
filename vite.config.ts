import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/unipago': {
        target: 'http://186.148.93.132/MedicamentosUnipago',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/unipago/, ''),
      },
    },
  },
})
