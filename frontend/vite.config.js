import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 開発中（npm run dev）は、/api で始まる依頼をバックエンド（Spring Boot）へ中継する（要件定義書 8.2）。
    // localhost ではなく 127.0.0.1 と書くのは、Spring Boot が 127.0.0.1 だけで待っていて（NFR-21）、
    // Node.js は localhost を IPv6（::1）で探すことがあり、そのままだとつながらないため。
    proxy: {
      '/api': 'http://127.0.0.1:8080',
    },
  },
})
