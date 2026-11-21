import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cardDragId, listDragId } from '../dnd.ts'
import type { Card as CardData, NewCard, TaskList } from '../types.ts'
import Card from './Card.tsx'
import CardDialog from './CardDialog.tsx'

/**
 * リスト1つ。リスト名と、その中のカードを上から並び順どおりに出し、下に「+ カードを追加」を置く。
 * カードを置ける場所になっているので、カードが1枚もないリストにも置ける（F-08）。
 */
export default function ListColumn({
  list,
  onAddCard,
  onOpenCard,
}: {
  list: TaskList
  onAddCard: (listId: number, newCard: NewCard) => Promise<boolean>
  onOpenCard: (card: CardData, listId: number) => void
}) {
  const [adding, setAdding] = useState(false) // カードを追加するダイアログを開いているか
  const { setNodeRef, isOver } = useDroppable({ id: listDragId(list.id) })

  return (
    <section ref={setNodeRef} className={isOver ? 'list drop-target' : 'list'}>
      <div className="list-header">
        <h2 className="list-title">{list.title}</h2>
      </div>
      <SortableContext items={list.cards.map((card) => cardDragId(card.id))} strategy={verticalListSortingStrategy}>
        <div className="cards">
          {list.cards.map((card) => (
            <Card key={card.id} card={card} onOpen={() => onOpenCard(card, list.id)} />
          ))}
        </div>
      </SortableContext>
      <button type="button" className="add-card" onClick={() => setAdding(true)}>
        + カードを追加
      </button>
      {adding && (
        <CardDialog
          heading="タスクを追加"
          subheading={list.title}
          // 登録のときは、優先度は最初「中」（先生の画面と同じ）。「なし」は選べない
          initial={{ text: '', description: null, priority: 'medium', dueDate: null, listId: list.id }}
          allowNoPriority={false}
          onSave={({ text, description, priority, dueDate }) =>
            onAddCard(list.id, { text, description, priority, dueDate })
          }
          onClose={() => setAdding(false)}
        />
      )}
    </section>
  )
}
