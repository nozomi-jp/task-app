import { useState } from 'react'
import { useDndContext, useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cardDragId, listDragId } from '../dnd.ts'
import { matchesSearch } from '../search.ts'
import type { Card as CardData, NewCard, SaveResult, SortKey, TaskList } from '../types.ts'
import Card from './Card.tsx'
import CardDialog from './CardDialog.tsx'
import SortButtons from './SortButtons.tsx'

/**
 * リスト1つ。リスト名と並べ替えのボタン、その中のカードを上から並び順どおりに出し、下に「+ カードを追加」を置く。
 * カードを置ける場所になっているので、カードが1枚もないリストにも置ける（F-08）。
 * 検索中（F-15）は、合うカードだけを出す。隠れたカードがあると置く場所がずれるので、カードは動かせない。
 */
export default function ListColumn({
  list,
  searchWords,
  onAddCard,
  onOpenCard,
  onDeleteCard,
  onSortCards,
}: {
  list: TaskList
  searchWords: string[]
  onAddCard: (listId: number, newCard: NewCard) => Promise<SaveResult>
  onOpenCard: (card: CardData, listId: number) => void
  onDeleteCard: (cardId: number) => void
  onSortCards: (listId: number, by: SortKey, reverse: boolean) => Promise<void>
}) {
  const [adding, setAdding] = useState(false) // カードを追加するダイアログを開いているか
  const { setNodeRef } = useDroppable({ id: listDragId(list.id) })
  // カードを持って、このリスト（またはその中のカード）の上に来ているか
  const { over } = useDndContext()
  const isOver =
    over !== null && (over.id === listDragId(list.id) || list.cards.some((card) => cardDragId(card.id) === over.id))

  const searching = searchWords.length > 0
  const cards = list.cards.filter((card) => matchesSearch(card, searchWords))

  return (
    <section ref={setNodeRef} className={isOver ? 'list drop-target' : 'list'}>
      <div className="list-header">
        <h2 className="list-title">{list.title}</h2>
        <SortButtons cards={list.cards} onSort={(by, reverse) => onSortCards(list.id, by, reverse)} />
      </div>
      <SortableContext items={cards.map((card) => cardDragId(card.id))} strategy={verticalListSortingStrategy}>
        <div className="cards">
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              draggable={!searching}
              onOpen={() => onOpenCard(card, list.id)}
              onDelete={() => onDeleteCard(card.id)}
            />
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
