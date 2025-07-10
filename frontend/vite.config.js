import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,        // 👈 change this to any fixed port
    strictPort: true   // 👈 prevents Vite from auto-switching ports
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
     
    },
  },
})
