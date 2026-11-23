// ボードのデータを変える処理（要件定義書 13.5 の state/。useReducer で使う）
// 「何が起きたか」（アクション）を受け取って、新しいボードを返す。元のボードは書き換えない。
import type { Board, Card, TaskList } from '../types.ts'

export type BoardAction =
  /** API からボードを読み込んだ */
  | { type: 'loaded'; board: Board }
  /** カードを追加した（API が返したカードを、そのリストの一番下に足す。index があれば、その位置に入れる） */
  | { type: 'cardAdded'; listId: number; card: Card; index?: number }
  /** カードの内容を更新した（API が返したカードで、同じ id のカードを置き換える。場所は変えない） */
  | { type: 'cardUpdated'; card: Card }
  /** リストの中のカードを並べ替えた（API が返した、並べ替えたあとのリストで置き換える） */
  | { type: 'listSorted'; list: TaskList }
  /** カードを削除した */
  | { type: 'cardDeleted'; cardId: number }
  /** カードを、指定したリストの指定した位置（0始まり）へ動かした（ドラッグ＆ドロップ） */
  | { type: 'cardMoved'; cardId: number; toListId: number; toIndex: number }

/** 読み込む前は null */
export type BoardState = Board | null

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'loaded':
      return action.board
    case 'cardAdded':
      if (state === null) return state
      return {
        lists: state.lists.map((list) =>
          list.id === action.listId
            ? { ...list, cards: list.cards.toSpliced(action.index ?? list.cards.length, 0, action.card) }
            : list,
        ),
      }
    case 'cardUpdated':
      if (state === null) return state
      return {
        lists: state.lists.map((list) => ({
          ...list,
          cards: list.cards.map((card) => (card.id === action.card.id ? action.card : card)),
        })),
      }
    case 'listSorted':
      if (state === null) return state
      return { lists: state.lists.map((list) => (list.id === action.list.id ? action.list : list)) }
    case 'cardDeleted':
      if (state === null) return state
      return {
        lists: state.lists.map((list) => ({
          ...list,
          cards: list.cards.filter((card) => card.id !== action.cardId),
        })),
      }
    case 'cardMoved':
      return state === null ? state : moveCardInBoard(state, action.cardId, action.toListId, action.toIndex)
  }
}

/** カードを今の場所から取り出し、移動先のリストの指定の位置に差し込んだ、新しいボードを返す */
export function moveCardInBoard(board: Board, cardId: number, toListId: number, toIndex: number): Board {
  const moving = board.lists.flatMap((list) => list.cards).find((card) => card.id === cardId)
  if (moving === undefined) return board
  const lists = board.lists.map((list) => ({ ...list, cards: list.cards.filter((card) => card.id !== cardId) }))
  return {
    lists: lists.map((list) => {
      if (list.id !== toListId) return list
      const cards = [...list.cards]
      cards.splice(Math.min(Math.max(toIndex, 0), cards.length), 0, moving)
      return { ...list, cards }
    }),
  }
}

/** カードが入っているリストの id と、リストの中の位置（0始まり）。見つからなければ null */
export function findCardPlace(board: Board, cardId: number): { listId: number; index: number } | null {
  for (const list of board.lists) {
    const index = list.cards.findIndex((card) => card.id === cardId)
    if (index !== -1) return { listId: list.id, index }
  }
  return null
}
