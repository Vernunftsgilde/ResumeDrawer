import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // 函数形式：Vite 8 / Rolldown 下对象字面量会报类型不兼容
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-router')) return 'react'
          if (id.includes('node_modules/@supabase') || id.includes('node_modules/@tanstack')) return 'vendor'
          return undefined
        },
      },
    },
  },
})
