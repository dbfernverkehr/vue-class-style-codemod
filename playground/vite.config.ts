import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const API_PORT = process.env.API_PORT || 3002

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/web/vue-class-style-codemod/' : '/',
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${API_PORT}/`,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, '')
      }
    }
  },
  plugins: [
    vue()
  ]
})
