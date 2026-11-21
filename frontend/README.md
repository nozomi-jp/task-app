# 画面（フロントエンド）

タスク管理アプリの画面。React（TypeScript）と Vite で作っている。詳しくは [要件定義書](../docs/requirements/README.md)。

## 開発中の動かし方

1. データベース（Docker）とバックエンド（`backend` で `.\mvnw.cmd spring-boot:run`）を起動しておく
2. このフォルダで、初めてのときだけ `npm install`
3. `npm run dev` → ブラウザで http://localhost:5173 を開く

**PowerShell では `npm` ではなく `npm.cmd` と打つ**（例：`npm.cmd run dev`）。Windows の PowerShell は最初の設定だとスクリプト（`npm.ps1`）の実行を止めるため。コマンドプロンプトや Git Bash なら `npm` のままでよい。

ポートは必ず 5173。ふさがっていると、別のポートへ逃げずにエラーで止まる（`vite.config.ts` の `strictPort`。決まりはリポジトリ直下の `CLAUDE.md`「サーバーの起動とポート」）。

`/api` で始まる依頼は、開発サーバーがバックエンド（http://127.0.0.1:8080）へ中継する（`vite.config.ts`）。

## コマンド

| コマンド | すること |
| --- | --- |
| `npm run dev` | 開発サーバーを起動する（書き換えるとすぐ画面に反映される）。止めるときは Ctrl + C |
| `npm run lint` | 書き方のチェック（oxlint） |
| `npm run build` | 型チェック（`tsc -b`）をしてから、ビルドする（`dist/` にできる。Git には入れない）。型の間違いがあるとビルドしない |

## ファイル

| 場所 | 役割 |
| --- | --- |
| `src/App.tsx` | ボード画面全体。開いたときに API でボードを読み込む |
| `src/components/` | 画面の部品（Board・ListColumn・Card） |
| `src/api/` | API を呼ぶ処理 |
| `src/types.ts` | API でやりとりするデータの形（型）。要件定義書 10章の API-01 と同じ |
| `src/format.ts` | 期限・優先度の表示のしかた |
| `tsconfig*.json` | TypeScript の型チェックの設定（Vite のひな型のまま） |
