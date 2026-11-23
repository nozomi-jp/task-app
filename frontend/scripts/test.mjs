// 自動テスト（Vitest）を動かす。npm run test から呼ぶ。
// Windows では、フォルダの場所のドライブの文字が小文字（c:）だと、Vitest が同じ部品を別物と見なして
// 「failed to find the runner」で失敗する（VS Code から開くと小文字になることがある）。
// そのため、本当の形（C:）に直した場所から Vitest を動かす。
import { spawnSync } from 'node:child_process'
import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const frontend = realpathSync.native(fileURLToPath(new URL('..', import.meta.url)))
const result = spawnSync(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', ...process.argv.slice(2)], {
  cwd: frontend,
  stdio: 'inherit',
})
process.exit(result.status ?? 1)
