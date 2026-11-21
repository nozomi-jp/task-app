import type { Board as BoardData, Card, NewCard } from '../types.ts'
import ListColumn from './ListColumn.tsx'

/** ボード。リストを左から並び順どおりに横に並べる（入りきらなければ下の段へ折り返す） */
export default function Board({
  board,
  onAddCard,
  onOpenCard,
}: {
  board: BoardData
  onAddCard: (listId: number, newCard: NewCard) => Promise<boolean>
  onOpenCard: (card: Card, listId: number) => void
}) {
  return (
    <main className="board">
      {board.lists.map((list) => (
        <ListColumn key={list.id} list={list} onAddCard={onAddCard} onOpenCard={onOpenCard} />
      ))}
    </main>
  )
}
