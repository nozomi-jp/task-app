# ポート 8080（バックエンド）・5173（画面）を使っているプロセスを止めて、ポートを空ける。
# CLAUDE.md「サーバーの起動とポート」の決まりで、Claude が使ってよいのはこのスクリプトだけ（発注者が 2026-11-21 に許可）。
# ほかのポート・ほかのプロセスを止めることはできない。
#
# 使い方（リポジトリのフォルダで）：
#   PowerShell： ./.claude/scripts/free-port.ps1 -Port 8080
#   Git Bash  ： powershell -NoProfile -ExecutionPolicy Bypass -File .claude/scripts/free-port.ps1 -Port 5173

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet(8080, 5173)]
    [int]$Port
)

$listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $listeners) {
    Write-Output "ポート $Port は空いています。"
    exit 0
}

foreach ($owner in ($listeners | Select-Object -ExpandProperty OwningProcess -Unique)) {
    # 0・4 は Windows 自身（System）。止めてはいけない
    if ($owner -le 4) {
        Write-Output "ポート $Port は Windows 自身（PID $owner）が使っているため、止められません。発注者に相談してください。"
        exit 1
    }
    $process = Get-Process -Id $owner -ErrorAction SilentlyContinue
    $commandLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $owner" -ErrorAction SilentlyContinue).CommandLine
    Write-Output "ポート $Port を使っているプロセスを止めます：PID $owner $($process.ProcessName)"
    if ($commandLine) { Write-Output "  コマンド：$commandLine" }
    Stop-Process -Id $owner -Force -ErrorAction Stop
}

# 止まってポートが空くまで、最大10秒待つ
for ($i = 0; $i -lt 20; $i++) {
    if (-not (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)) {
        Write-Output "ポート $Port を空けました。"
        exit 0
    }
    Start-Sleep -Milliseconds 500
}
Write-Output "ポート $Port がまだ空きません。発注者に相談してください。"
exit 1
