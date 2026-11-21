import type { Board as BoardData, NewCard } from '../types.ts'
import ListColumn from './ListColumn.tsx'

/** ボード。リストを左から並び順どおりに横に並べる（入りきらなければ下の段へ折り返す） */
export default function Board({
  board,
  onAddCard,
}: {
  board: BoardData
  onAddCard: (listId: number, newCard: NewCard) => Promise<boolean>
}) {
  return (
    <main className="board">
      {board.lists.map((list) => (
        <ListColumn key={list.id} list={list} onAddCard={onAddCard} />
      ))}
    </main>
  )
}
