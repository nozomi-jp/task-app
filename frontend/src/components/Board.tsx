import { useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { parseDragId } from '../dnd.ts'
import { findCardPlace, moveCardInBoard } from '../state/boardReducer.ts'
import type { Board as BoardData, Card, NewCard } from '../types.ts'
import { CardOverlay } from './Card.tsx'
import ListColumn from './ListColumn.tsx'

/**
 * ボード。リストを左から並び順どおりに横に並べる（入りきらなければ下の段へ折り返す）。
 * カードのドラッグ＆ドロップ（F-08 移動・F-09 並べ替え）をまとめて受け持つ。
 * - 動かしている間は、画面の上だけで仮に動かして、置く位置を見せる
 * - 離したら onCommitMove で保存する。リストの外で離したとき・Esc でやめたときは、つかむ前の状態に戻す
 */
export default function Board({
  board,
  onAddCard,
  onOpenCard,
  onPreviewMove,
  onRestore,
  onCommitMove,
}: {
  board: BoardData
  onAddCard: (listId: number, newCard: NewCard) => Promise<boolean>
  onOpenCard: (card: Card, listId: number) => void
  /** 画面の上だけで、カードを仮に動かす */
  onPreviewMove: (cardId: number, toListId: number, toIndex: number) => void
  /** つかむ前のボードに戻す */
  onRestore: (board: BoardData) => void
  /** 置いた場所を保存する（API-08） */
  onCommitMove: (cardId: number, listId: number, position: number) => void
}) {
  const [draggingCard, setDraggingCard] = useState<Card | null>(null)
  const beforeDrag = useRef<BoardData | null>(null) // つかむ前のボード（やめたときに戻すため）

  const sensors = useSensors(
    // 5px 以上動かしたらドラッグ。それより小さければクリック（詳細画面を開く）として扱う
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    // キーボード：Space でつかみ、矢印キーで動かし、Space で置く（Enter は詳細画面に使う）
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space'] },
    }),
  )

  /** カードの上・リストの上のどちらに重なっているかから、置く先のリストと位置を決める */
  function dropPlace(current: BoardData, overId: string | number): { listId: number; index: number } | null {
    const over = parseDragId(overId)
    if (over === null) return null
    if (over.kind === 'list') {
      const list = current.lists.find((l) => l.id === over.id)
      return list ? { listId: list.id, index: list.cards.length } : null
    }
    return findCardPlace(current, over.id)
  }

  function handleDragStart(event: DragStartEvent) {
    const active = parseDragId(event.active.id)
    beforeDrag.current = board
    setDraggingCard(board.lists.flatMap((l) => l.cards).find((c) => c.id === active?.id) ?? null)
  }

  // 別のリストの上に来たら、その場でそのリストへ仮に移す（置く位置がすぐ見えるように）
  function handleDragOver(event: DragOverEvent) {
    const active = parseDragId(event.active.id)
    if (active === null || event.over === null) return
    const from = findCardPlace(board, active.id)
    const to = dropPlace(board, event.over.id)
    if (from === null || to === null || from.listId === to.listId) return
    onPreviewMove(active.id, to.listId, to.index)
  }

  function handleDragEnd(event: DragEndEvent) {
    const active = parseDragId(event.active.id)
    const before = beforeDrag.current
    setDraggingCard(null)
    beforeDrag.current = null
    if (active === null || before === null) return

    // リストの外で離したときは、元の場所に戻す（F-08）
    if (event.over === null) {
      onRestore(before)
      return
    }

    // 同じリストの中で別のカードの上に来ていたら、その位置へ（並べ替え、F-09）
    let after = board
    const from = findCardPlace(board, active.id)
    const to = dropPlace(board, event.over.id)
    if (from !== null && to !== null && from.listId === to.listId && from.index !== to.index) {
      after = moveCardInBoard(board, active.id, to.listId, to.index)
      onPreviewMove(active.id, to.listId, to.index)
    }

    // つかむ前と場所が変わっていれば保存する
    const start = findCardPlace(before, active.id)
    const end = findCardPlace(after, active.id)
    if (start !== null && end !== null && (start.listId !== end.listId || start.index !== end.index)) {
      onCommitMove(active.id, end.listId, end.index)
    }
  }

  // Esc でやめたときは、つかむ前の状態に戻す
  function handleDragCancel() {
    if (beforeDrag.current !== null) onRestore(beforeDrag.current)
    beforeDrag.current = null
    setDraggingCard(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <main className="board">
        {board.lists.map((list) => (
          <ListColumn key={list.id} list={list} onAddCard={onAddCard} onOpenCard={onOpenCard} />
        ))}
      </main>
      {/* つかんでいる間、マウスについてくるカード */}
      <DragOverlay>{draggingCard ? <CardOverlay card={draggingCard} /> : null}</DragOverlay>
    </DndContext>
  )
}
