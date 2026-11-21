import type { Board as BoardData } from '../types.ts'
import ListColumn from './ListColumn.tsx'

/** ボード。リストを左から並び順どおりに横に並べる（入りきらなければ下の段へ折り返す） */
export default function Board({ board }: { board: BoardData }) {
  return (
    <main className="board">
      {board.lists.map((list) => (
        <ListColumn key={list.id} list={list} />
      ))}
    </main>
  )
}
