import type { TaskList } from '../types.ts'
import Card from './Card.tsx'

/** リスト1つ。リスト名と、その中のカードを上から並び順どおりに出す */
export default function ListColumn({ list }: { list: TaskList }) {
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
    </section>
  )
}
