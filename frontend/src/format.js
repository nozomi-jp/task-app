// 期限と優先度の表示のしかた（要件定義書 F-11・F-12）

/**
 * "2026-11-25" のような日付の文字を、年・月・日の数に分ける。
 * new Date("2026-11-25") は時差の扱いで日付がずれることがあるので使わない。
 */
function parseDate(text) {
  const [year, month, day] = text.split('-').map(Number)
  return { year, month, day }
}

/** 今日の日付を "2026-11-25" の形で返す（パソコンの時計の日付） */
function todayText() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** 期限の表示。今年なら "11/25"、今年でなければ "2027/1/5" */
export function formatDueDate(dueDate) {
  const { year, month, day } = parseDate(dueDate)
  const thisYear = new Date().getFullYear()
  return year === thisYear ? `${month}/${day}` : `${year}/${month}/${day}`
}

/**
 * 期限の状態。色分けに使う。
 * "today"：今日が期限（黄）、"overdue"：期限を過ぎた（赤）、"normal"：それ以外（グレー）
 * "2026-11-25" の形の文字は、そのまま大小を比べると日付の前後と同じになる。
 */
export function dueDateStatus(dueDate) {
  const today = todayText()
  if (dueDate === today) return 'today'
  if (dueDate < today) return 'overdue'
  return 'normal'
}

/** 優先度の表示名（API の値 → 画面の文字） */
export const PRIORITY_LABELS = {
  high: '高',
  medium: '中',
  low: '低',
}
