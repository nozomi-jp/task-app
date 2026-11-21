#!/usr/bin/env bash
# Claude Code の PreToolUse フック（Bash / PowerShell / Edit / Write 用）
# CLAUDE.md「サーバーの起動とポート」を機械的に守らせる：
#   サーバーはバックエンド 8080・画面 5173 だけで動かす。別のポートで起動しない。
# 止めるもの：
#   - コマンドで別のポートを指定する（--port 5174、--server.port=8081、-Dserver.port=9090、SERVER_PORT=8081 など）
#   - コマンドや設定で strictPort を false にする（ふさがっていると別のポートへ逃げてしまう）
#   - application.properties / vite.config.ts のポートを 8080・5173 以外に書き換える
# 違反したら exit 2 で止め、理由を Claude に返す。

input="$(cat)"

block() {
  echo "ブロックしました: $1" >&2
  echo "ルール（CLAUDE.md「サーバーの起動とポート」）: サーバーはバックエンド 8080・画面 5173 だけで起動する。ふさがっていたら .claude/skills/start-servers/scripts/free-port.ps1 で空けてから、同じポートで起動する。" >&2
  exit 2
}

# 渡された数字の中に 8080・5173 以外があれば真
has_other_port() {
  for n in $1; do
    case "$n" in
      8080|5173) ;;
      *) return 0 ;;
    esac
  done
  return 1
}

tool="$(printf '%s' "$input" | grep -oE '"tool_name" *: *"[^"]*"' | head -1 | sed -E 's/.*"([^"]*)"$/\1/')"

case "$tool" in
  Bash|PowerShell)
    nums="$(printf '%s' "$input" | grep -oiE '(server[._-]port|--port)[= :]+[0-9]+' | grep -oE '[0-9]+$')"
    if [ -n "$nums" ] && has_other_port "$nums"; then
      block "決まったポート以外でサーバーを起動しようとしています（$(echo $nums)）。"
    fi
    if printf '%s' "$input" | grep -qiE 'strictPort[= :]+false|--no-strictPort'; then
      block "strictPort を外すと、ポートがふさがっているときに別のポートで起動してしまいます。"
    fi
    ;;
  Edit|Write|MultiEdit)
    file="$(printf '%s' "$input" | grep -oE '"file_path" *: *"[^"]*"' | head -1 | sed -E 's/.*"([^"]*)"$/\1/')"
    case "$file" in
      *application.properties|*vite.config.js|*vite.config.mjs|*vite.config.ts)
        nums="$(printf '%s' "$input" | grep -oiE '(server\.port *=|[^A-Za-z]port *:) *[0-9]+' | grep -oE '[0-9]+$')"
        if [ -n "$nums" ] && has_other_port "$nums"; then
          block "設定ファイルのポートを 8080・5173 以外にしようとしています（$(echo $nums)）。"
        fi
        if printf '%s' "$input" | grep -qiE 'strictPort *: *false'; then
          block "vite.config.ts の strictPort は true のままにします。"
        fi
        ;;
    esac
    ;;
esac

exit 0
