---
name: start-servers
description: このアプリのサーバー（バックエンド 8080・画面 5173）を起動して動作確認するときの手順。サーバーの起動・再起動・動作確認・「ポートが使われている」エラーのときは必ずこれに従う。ポートがふさがっていたら止めてから、決まったポートだけで起動する（別のポートは禁止）
---

# サーバーを起動して動作確認する

決まり（CLAUDE.md「サーバーの起動とポート」）：

| サーバー | ポート | 起動するフォルダ | コマンド |
| --- | --- | --- | --- |
| バックエンド（Spring Boot） | **8080** | `backend` | `.\mvnw.cmd spring-boot:run` |
| 画面（Vite の開発サーバー） | **5173** | `frontend` | `npm.cmd run dev` |

- **別のポートでは絶対に起動しない。** `--port`・`server.port` の上書き・`SERVER_PORT`・`strictPort: false` は使わない（フック `.claude/hooks/guard-ports.sh` が止める）。
- ポートがふさがっていたら、そのプロセスを止めてから、同じポートで起動する。

## 手順

1. **データベースを確かめる**：`docker compose ps` で `db` が `healthy`。なければ `docker compose up -d`（5432 は Docker の PostgreSQL。このスクリプトの対象外）
2. **ポートを確かめて、ふさがっていたら空ける**（リポジトリのフォルダで実行する）
   ```powershell
   ./.claude/scripts/free-port.ps1 -Port 8080
   ./.claude/scripts/free-port.ps1 -Port 5173
   ```
   - 空いていれば「空いています」と出るだけで、何もしない
   - ふさがっていれば、使っていたプロセス（PID・名前・コマンド）を表示して止める。**止めたら、何を止めたかをユーザーに必ず伝える**（ユーザーが自分のターミナルで起動したサーバーのことが多い）
   - 「止められません」「まだ空きません」と出たら、それ以上は何もせず、ユーザーに相談する
3. **起動する**：Claude が確認のために起動するときは、ツールの「バックグラウンドで実行」（run_in_background）を使う
   - バックエンド：ログに `Started TaskboardApplication` が出るまで待つ
   - 画面：ログに `Local:   http://localhost:5173/` が出るまで待つ
   - 起動に失敗して「Port 8080 was already in use」「Port 5173 is already in use」と出たら、手順2に戻る。**別のポートで試さない**
4. **確認する**：`curl http://localhost:8080/api/board`、`curl http://localhost:5173/`、`curl http://localhost:5173/api/board`（中継の確認）など
5. **後片付け**：自分が起動したサーバーは、確認が終わったら TaskStop で止める。止めたあとで手順2のスクリプトを実行し、ポートが空いたことを確かめる（子のプロセスが残っていたら、それも空けられる）

## ユーザーに起動してもらうとき

CLAUDE.md とメモリの決まりどおり、「ターミナルを開く」から1行ずつ書く。`cd` と次のコマンドは別のコードブロックにし、PowerShell では `npm` ではなく `npm.cmd` と書く。ポートがふさがっているエラーが出たと言われたら、手順2のスクリプトで Claude が空ける（または「前に起動したターミナルで Ctrl + C」と案内する）。

## してはいけないこと

- 8080・5173 以外のポートを使っているプロセスを止める（`Stop-Process`・`taskkill` は禁止のまま。使ってよいのは `free-port.ps1` だけ）
- 5432（データベース）を止める
- 設定ファイル（`application.properties` の `server.port`、`vite.config.js` の `port`・`strictPort`）を書き換える
