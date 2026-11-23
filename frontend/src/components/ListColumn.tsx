import { useState } from 'react'
import { useDndContext, useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cardDragId, listDragId } from '../dnd.ts'
import { isFiltering, matchesSearch, type SearchFilter } from '../search.ts'
import type { Card as CardData, NewCard, SaveResult, SortKey, TaskList } from '../types.ts'
import Card from './Card.tsx'
import CardDialog from './CardDialog.tsx'
import ListHeader from './ListHeader.tsx'

/**
 * リスト1つ。リスト名と並べ替えのボタン、その中のカードを上から並び順どおりに出し、下に「+ カードを追加」を置く。
 * カードを置ける場所になっているので、カードが1枚もないリストにも置ける（F-08）。
 * 検索中（F-15・F-16）は、合うカードだけを出す。隠れたカードがあると置く場所がずれるので、カードは動かせない。
 */
export default function ListColumn({
  list,
  filter,
  onRename,
  onDelete,
  onAddCard,
  onOpenCard,
  onDeleteCard,
  onSortCards,
}: {
  list: TaskList
  filter: SearchFilter
  /** このリストの名前を変える */
  onRename: (title: string) => Promise<SaveResult>
  /** このリストを削除する */
  onDelete: () => void
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

  const searching = isFiltering(filter)
  const cards = list.cards.filter((card) => matchesSearch(card, filter))

  return (
    <section ref={setNodeRef} className={isOver ? 'list drop-target' : 'list'}>
      <ListHeader
        list={list}
        onRename={onRename}
        // 絞り込んでいる間は、見えていないカードまで消さないように、削除できなくする
        onDelete={searching ? null : onDelete}
        onSort={(by, reverse) => onSortCards(list.id, by, reverse)}
      />
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
          initial={{ text: '', description: null, priority: 'medium', dueDate: null, label: null, listId: list.id }}
          allowNoPriority={false}
          onSave={({ text, description, priority, dueDate, label }) =>
            onAddCard(list.id, { text, description, priority, dueDate, label })
          }
          onClose={() => setAdding(false)}
        />
      )}
    </section>
  )
}
