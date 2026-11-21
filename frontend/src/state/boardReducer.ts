// ボードのデータを変える処理（要件定義書 13.5 の state/。useReducer で使う）
// 「何が起きたか」（アクション）を受け取って、新しいボードを返す。元のボードは書き換えない。
import type { Board, Card } from '../types.ts'

export type BoardAction =
  /** API からボードを読み込んだ */
  | { type: 'loaded'; board: Board }
  /** カードを追加した（API が返したカードを、そのリストの一番下に足す） */
  | { type: 'cardAdded'; listId: number; card: Card }

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
          list.id === action.listId ? { ...list, cards: [...list.cards, action.card] } : list,
        ),
      }
  }
}
