import { useEffect, useRef, useState } from 'react'
import { currentDirection } from '../sort.ts'
import type { Card, SortKey } from '../types.ts'

/** 並べ替えの種類と、それぞれの向きの言い方 */
const CHOICES: { by: SortKey; label: string; forward: string; reverse: string }[] = [
  { by: 'dueDate', label: '期限', forward: '期限が近い順', reverse: '期限が遠い順' },
  { by: 'priority', label: '優先度', forward: '優先度が高い順', reverse: '優先度が低い順' },
]

/**
 * 並べ替えのメニュー（F-13、SC-01-f）。リスト名の右の「⇅」を押すと、「期限」「優先度」が横に並んで出る。
 * - 1回押すと期限が近い順・優先度が高い順、もう一度押すと反対の順。今の向きを ▲▼ で出す
 *   （「もう一度」かどうかは、今のカードの並びを見て決める。再読み込みやドラッグのあとでも向きがおかしくならない）
 * - 続けて押せるように、押してもメニューは開いたまま。Esc・メニューの外のクリック・「⇅」で閉じる
 */
export default function SortMenu({
  listTitle,
  cards,
  onSort,
}: {
  listTitle: string
  cards: Card[]
  onSort: (by: SortKey, reverse: boolean) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false) // 保存が終わるまで、続けて押されても受け付けない
  const rootRef = useRef<HTMLDivElement>(null)

  // 開いている間だけ、Esc と外のクリックを見張る
  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: PointerEvent) {
      if (e.target instanceof Node && !rootRef.current?.contains(e.target)) setOpen(false)
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  async function handleSort(by: SortKey, reverse: boolean) {
    if (saving) return
    setSaving(true)
    await onSort(by, reverse)
    setSaving(false)
  }

  return (
    <div ref={rootRef} className="sort">
      <button
        type="button"
        className="icon-btn"
        title="カードを並べ替え"
        aria-label={`${listTitle} のカードを並べ替え`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        ⇅
      </button>
      {open && (
        <div className="menu">
          {CHOICES.map(({ by, label, forward, reverse }) => {
            const now = currentDirection(cards, by)
            const nextReverse = now === 'forward'
            return (
              <button
                key={by}
                type="button"
                className={now ? 'menu-item current' : 'menu-item'}
                title={`${nextReverse ? reverse : forward}に並べ替え`}
                onClick={() => void handleSort(by, nextReverse)}
              >
                {label}
                {now && (
                  <span aria-label={now === 'forward' ? `（今は${forward}）` : `（今は${reverse}）`}>
                    {now === 'forward' ? ' ▲' : ' ▼'}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
