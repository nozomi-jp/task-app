import type { Card as CardData, Priority } from '../types.ts'
import { PRIORITY_LABELS, dueDateStatus, formatDueDate } from '../format.ts'

/**
 * カード1枚。文字と、右側に期限・優先度の印を出す（F-11・F-12）。
 * 今回は表示だけ。印を押しても何も起きない。
 */
export default function Card({ card }: { card: CardData }) {
  return (
    <div className="card">
      <span className="card-text">{card.text}</span>
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
