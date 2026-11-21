import type { TaskList } from '../types.ts'
import AddCardForm from './AddCardForm.tsx'
import Card from './Card.tsx'

/** リスト1つ。リスト名と、その中のカードを上から並び順どおりに出し、下に「+ カードを追加」を置く */
export default function ListColumn({
  list,
  onAddCard,
}: {
  list: TaskList
  onAddCard: (listId: number, text: string) => Promise<boolean>
}) {
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
      <AddCardForm onAdd={(text) => onAddCard(list.id, text)} />
    </section>
  )
}
