import { useState } from 'react'
import { currentDirection, type SortDirection } from '../sort.ts'
import type { Card, SortKey } from '../types.ts'

/** 並べ替えの種類と、それぞれの向きの言い方 */
const CHOICES: { by: SortKey; label: string; forward: string; reverse: string }[] = [
  { by: 'dueDate', label: '期限', forward: '期限が近い順', reverse: '期限が遠い順' },
  { by: 'priority', label: '優先度', forward: '優先度が高い順', reverse: '優先度が低い順' },
]

/** 今の並びの向きを表す矢印。その順に並んでいないときは ⇅ */
function arrowOf(direction: SortDirection | null): string {
  if (direction === 'forward') return '▲'
  return direction === 'reverse' ? '▼' : '⇅'
}

/**
 * 並べ替えのボタン（F-13、SC-01-f）。リスト名の右に「期限 ⇅」「優先度 ⇅」をいつも出す。
 * - 1回押すと期限が近い順・優先度が高い順（▲）、もう一度押すと反対の順（▼）
 *   （「もう一度」かどうかは、今のカードの並びを見て決める。再読み込みやドラッグのあとでも向きがおかしくならない）
 */
export default function SortButtons({
  cards,
  onSort,
}: {
  cards: Card[]
  onSort: (by: SortKey, reverse: boolean) => Promise<void>
}) {
  const [saving, setSaving] = useState(false) // 保存が終わるまで、続けて押されても受け付けない

  async function handleSort(by: SortKey, reverse: boolean) {
    if (saving) return
    setSaving(true)
    await onSort(by, reverse)
    setSaving(false)
  }

  return (
    <div className="sort">
      {CHOICES.map(({ by, label, forward, reverse }) => {
        const now = currentDirection(cards, by)
        const nextReverse = now === 'forward'
        const next = `${nextReverse ? reverse : forward}に並べ替え`
        return (
          <button
            key={by}
            type="button"
            className={now ? 'sort-btn current' : 'sort-btn'}
            title={next}
            aria-label={now ? `${next}（今は${now === 'forward' ? forward : reverse}）` : next}
            onClick={() => void handleSort(by, nextReverse)}
          >
            {label} {arrowOf(now)}
          </button>
        )
      })}
    </div>
  )
}
