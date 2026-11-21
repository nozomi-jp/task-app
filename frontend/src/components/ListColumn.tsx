import { useState } from 'react'
import type { NewCard, TaskList } from '../types.ts'
import AddCardDialog from './AddCardDialog.tsx'
import Card from './Card.tsx'

/** リスト1つ。リスト名と、その中のカードを上から並び順どおりに出し、下に「+ カードを追加」を置く */
export default function ListColumn({
  list,
  onAddCard,
}: {
  list: TaskList
  onAddCard: (listId: number, newCard: NewCard) => Promise<boolean>
}) {
  const [adding, setAdding] = useState(false) // カードを追加するダイアログを開いているか

  return (
    <section className="list">
      <div className="list-header">
        <h2 className="list-title">{list.title}</h2>
      </div>
      <div className="cards">
        {list.cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
      <button type="button" className="add-card" onClick={() => setAdding(true)}>
        + カードを追加
      </button>
      {adding && (
        <AddCardDialog
          listTitle={list.title}
          onSave={(newCard) => onAddCard(list.id, newCard)}
          onClose={() => setAdding(false)}
        />
      )}
    </section>
  )
}
