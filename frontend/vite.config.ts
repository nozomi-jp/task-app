import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // ビルドした画面は Spring Boot が配る（http://localhost:8080、要件定義書 8.1）。Git には入れない。
    outDir: '../backend/src/main/resources/static',
    // 出力先が frontend の外にあるので、true と書かないと古い完成品が残る。
    // ビルドのたびに、このフォルダの中身はすべて入れ替わる（手で作ったファイルを置かないこと）。
    emptyOutDir: true,
  },
  server: {
    // 画面の開発サーバーは必ず 5173 番で動かす（CLAUDE.md「サーバーの起動とポート」）。
    // strictPort: true にすると、5173 がふさがっているときに 5174 などへ逃げず、エラーで止まる。
    port: 5173,
    strictPort: true,
    // 開発中（npm run dev）は、/api で始まる依頼をバックエンド（Spring Boot）へ中継する（要件定義書 8.2）。
    // localhost ではなく 127.0.0.1 と書くのは、Spring Boot が 127.0.0.1 だけで待っていて（NFR-21）、
    // Node.js は localhost を IPv6（::1）で探すことがあり、そのままだとつながらないため。
    proxy: {
      '/api': 'http://127.0.0.1:8080',
    },
  },
})
