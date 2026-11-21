import type { KeyboardEvent } from 'react'
import type { Card as CardData, Priority } from '../types.ts'
import { PRIORITY_LABELS, dueDateStatus, formatDueDate } from '../format.ts'

/**
 * カード1枚。タイトルと、その下に説明（あれば小さく）、右側に期限・優先度の印を出す（F-05・F-11・F-12）。
 * クリック（またはキーボードで選んで Enter）すると、詳細画面を開く（F-06）。
 */
export default function Card({ card, onOpen }: { card: CardData; onOpen: () => void }) {
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen()
    }
  }

  return (
    <div
      className="card"
      role="button"
      tabIndex={0}
      aria-label={`${card.text} の詳細を開く`}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
    >
      <div className="card-body">
        <span className="card-text">{card.text}</span>
        {card.description !== null && <p className="card-description">{card.description}</p>}
      </div>
      <span className="card-meta">
        <DueDateChip dueDate={card.dueDate} />
        <PriorityChip priority={card.priority} />
      </span>
    </div>
  )
}

/** 期限の色分けに使う CSS のクラス名 */
const DUE_DATE_CLASS = {
  today: 'chip today',
  overdue: 'chip overdue',
  normal: 'chip due',
} as const

/** 期限の印。今日＝黄、過ぎた＝赤、それ以外＝グレー。期限がなければ薄い「期限」 */
function DueDateChip({ dueDate }: { dueDate: string | null }) {
  if (dueDate === null) {
    return <span className="chip empty">期限</span>
  }
  return <span className={DUE_DATE_CLASS[dueDateStatus(dueDate)]}>{formatDueDate(dueDate)}</span>
}

/** 優先度の印。高＝赤、中＝オレンジ、低＝青。優先度がなければ薄い「優先度」 */
function PriorityChip({ priority }: { priority: Priority | null }) {
  if (priority === null) {
    return <span className="chip empty">優先度</span>
  }
  return <span className={`chip prio-${priority}`}>{PRIORITY_LABELS[priority]}</span>
}
