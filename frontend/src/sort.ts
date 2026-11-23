// リストの中のカードの並べ替え（F-13）。並べ替えそのものはバックエンドが行う（API-09）。
// ここでは「今どの順に並んでいるか」を調べる。ボタンを押したときの向き（もう一度押すと反対）と、▲▼ の表示に使う。
import type { Card, SortKey } from './types.ts'

/** 並びの向き。forward：期限が近い順・優先度が高い順、reverse：その反対 */
export type SortDirection = 'forward' | 'reverse'

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 } as const

/** 並べ替えに使う値（小さいほど上）。付けていなければ null。期限は "2026-11-25" の形なので、数に直して比べる */
function sortValue(card: Card, by: SortKey): number | null {
  if (by === 'priority') return card.priority === null ? null : PRIORITY_RANK[card.priority]
  return card.dueDate === null ? null : Number(card.dueDate.replaceAll('-', ''))
}

/**
 * カードが今どの向きに並んでいるか。どちらでもなければ null。
 * 付けていないカード（null）はいつも一番下なので、上にまざっていれば「並んでいない」とする。
 * 付けた値が2種類以上ないと向きが決まらないので、そのときも null。
 */
export function currentDirection(cards: Card[], by: SortKey): SortDirection | null {
  const values = cards.map((card) => sortValue(card, by))
  const firstNone = values.indexOf(null)
  if (firstNone !== -1 && values.slice(firstNone).some((value) => value !== null)) return null
  const set = values.filter((value) => value !== null)
  if (new Set(set).size < 2) return null
  if (set.every((value, i) => i === 0 || set[i - 1] <= value)) return 'forward'
  if (set.every((value, i) => i === 0 || set[i - 1] >= value)) return 'reverse'
  return null
}
