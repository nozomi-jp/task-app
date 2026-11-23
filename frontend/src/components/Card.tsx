import type { KeyboardEvent } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cardDragId } from '../dnd.ts'
import type { Card as CardData, Priority } from '../types.ts'
import { PRIORITY_LABELS, dueDateStatus, formatDueDate } from '../format.ts'

/**
 * カード1枚（ドラッグできる）。
 * - クリック（またはキーボードで選んで Enter）すると、詳細画面を開く（F-06）
 * - つかんで動かすと、別のリストへ移したり並べ替えたりできる（F-08・F-09）。キーボードでは Space でつかむ
 * - つかんでいる間、元の場所のカードは半透明になる（置く位置の目印）
 * - draggable が false の間（検索中）は動かせない。クリックと「×」は使える
 * - マウスを乗せたときだけ右端に「×」が出て、押すと確認なしですぐ削除する（F-07）
 *   「×」は、クリックやドラッグを受け付ける部分（.card）の外に重ねて置くので、押しても詳細画面やドラッグにならない
 */
export default function Card({
  card,
  draggable,
  onOpen,
  onDelete,
}: {
  card: CardData
  draggable: boolean
  onOpen: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: cardDragId(card.id),
    disabled: !draggable,
  })

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    // Space などのドラッグの操作は dnd-kit に任せる
    listeners?.onKeyDown?.(e)
    if (e.key === 'Enter') {
      e.preventDefault()
      onOpen()
    }
  }

  return (
    <div
      ref={setNodeRef}
      className="card-wrap"
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {/* 役割（role="button"）と tabIndex は、dnd-kit の attributes が付ける。lint には見えないので例外にする（キーボードで選び、Enter・Space で使えることを確認済み） */}
      {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        ref={setActivatorNodeRef}
        className={isDragging ? 'card dragging' : 'card'}
        {...attributes}
        {...listeners}
        aria-disabled={false} // 動かせない間も、クリックや Enter は使える（attributes の aria-disabled を上書きする）
        aria-label={`${card.text}（Enter で詳細を開く${draggable ? '、Space でつかんで動かす' : ''}）`}
        onClick={onOpen}
        onKeyDown={handleKeyDown}
      >
        <CardContent card={card} />
      </div>
      <button type="button" className="card-delete" aria-label={`${card.text} を削除`} title="削除" onClick={onDelete}>
        ×
      </button>
    </div>
  )
}

/** ドラッグ中にマウスについてくるカード（見た目だけ） */
export function CardOverlay({ card }: { card: CardData }) {
  return (
    <div className="card overlay">
      <CardContent card={card} />
    </div>
  )
}

/** カードの中身：タイトル、その下に説明（あれば小さく）、右側に期限・優先度の印（F-05・F-11・F-12） */
function CardContent({ card }: { card: CardData }) {
  return (
    <>
      <div className="card-body">
        <span className="card-text">{card.text}</span>
        {card.description !== null && <p className="card-description">{card.description}</p>}
      </div>
      <span className="card-meta">
        <DueDateChip dueDate={card.dueDate} />
        <PriorityChip priority={card.priority} />
      </span>
    </>
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
