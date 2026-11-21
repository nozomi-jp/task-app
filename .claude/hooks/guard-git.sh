#!/usr/bin/env bash
# Claude Code の PreToolUse フック（Bash / PowerShell ツール用）
# 開発ルール（CLAUDE.md）のうち、次の2つを機械的に守らせる。
#   1. main ブランチの上で git commit / git push をしない
#   2. どのブランチからでも main へ直接 push しない
# 違反したら exit 2 で止め、理由を Claude に返す。

input="$(cat)"

# git commit / git push を含まないコマンドは素通し
if ! printf '%s' "$input" | grep -Eq 'git[[:space:]]+(commit|push)'; then
  exit 0
fi

project_dir="${CLAUDE_PROJECT_DIR:-.}"
branch="$(git -C "$project_dir" branch --show-current 2>/dev/null)"

block() {
  echo "ブロックしました: $1" >&2
  echo "ルール（CLAUDE.md）: イシューを作り、ブランチを切ってから作業し、main へは PR でマージします。" >&2
  exit 2
}

if [ "$branch" = "main" ]; then
  block "いま main ブランチにいます。main の上で commit / push はできません。先に作業用ブランチ（例: feature/12-xxx）を作ってください。"
fi

# git push origin main / git push origin HEAD:main / --all などで main を直接更新しようとしていないか
if printf '%s' "$input" | grep -Eq 'git[[:space:]]+push[^"]*([[:space:]:]|refs/heads/)main([[:space:]"]|$)'; then
  block "main へ直接 push しようとしています。作業ブランチを push して PR を作ってください。"
fi
if printf '%s' "$input" | grep -Eq 'git[[:space:]]+push[^"]*--(all|mirror)'; then
  block "git push --all / --mirror は main も更新してしまうため禁止です。"
fi

exit 0
