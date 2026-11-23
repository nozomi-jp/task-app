import { describe, expect, test } from 'vitest'
import { testCard } from '../testCard.ts'
import type { Board } from '../types.ts'
import { boardReducer, findCardPlace, type BoardAction, type BoardState } from './boardReducer.ts'

/** リスト1（a・b・c）、リスト2（d）、リスト3（空） */
const board: Board = {
  lists: [
    { id: 1, title: 'ToDo', cards: [testCard({ id: 11, text: 'a' }), testCard({ id: 12, text: 'b' }), testCard({ id: 13, text: 'c' })] },
    { id: 2, title: '進行中', cards: [testCard({ id: 21, text: 'd' })] },
    { id: 3, title: '完了', cards: [] },
  ],
}

/** アクションのあとのボードを「ToDo:abc」の形にする */
function after(action: BoardAction): string[] | undefined {
  return boardReducer(board, action)?.lists.map((list) => `${list.title}:${list.cards.map((card) => card.text).join('')}`)
}

describe('リスト', () => {
  test('追加：一番最後に足す', () => {
    expect(after({ type: 'listAdded', list: { id: 4, title: '保留', cards: [] } })).toEqual(['ToDo:abc', '進行中:d', '完了:', '保留:'])
  })

  test('名前変更：中のカードと場所はそのまま', () => {
    expect(after({ type: 'listRenamed', listId: 2, title: '作業中' })).toEqual(['ToDo:abc', '作業中:d', '完了:'])
  })

  test('削除：そのリストだけなくなる', () => {
    expect(after({ type: 'listDeleted', listId: 1 })).toEqual(['進行中:d', '完了:'])
  })

  test('並べ替え：返ってきたリストで置き換える', () => {
    const list = { ...board.lists[0], cards: board.lists[0].cards.toReversed() }
    expect(after({ type: 'listSorted', list })).toEqual(['ToDo:cba', '進行中:d', '完了:'])
  })
})

describe('カード', () => {
  const card = testCard({ id: 99, text: 'x' })

  test('追加：一番下。index があれば、その位置（元に戻す）。大きすぎれば一番下', () => {
    expect(after({ type: 'cardAdded', listId: 1, card })?.[0]).toBe('ToDo:abcx')
    expect(after({ type: 'cardAdded', listId: 1, card, index: 0 })?.[0]).toBe('ToDo:xabc')
    expect(after({ type: 'cardAdded', listId: 1, card, index: 1 })?.[0]).toBe('ToDo:axbc')
    expect(after({ type: 'cardAdded', listId: 1, card, index: 99 })?.[0]).toBe('ToDo:abcx')
  })

  test('更新：内容だけが変わり、場所はそのまま', () => {
    expect(after({ type: 'cardUpdated', card: testCard({ id: 12, text: 'B' }) })).toEqual(['ToDo:aBc', '進行中:d', '完了:'])
  })

  test('削除', () => {
    expect(after({ type: 'cardDeleted', cardId: 12 })).toEqual(['ToDo:ac', '進行中:d', '完了:'])
  })

  test('移動：別のリスト・同じリスト・空のリスト・大きすぎる位置', () => {
    expect(after({ type: 'cardMoved', cardId: 12, toListId: 2, toIndex: 0 })).toEqual(['ToDo:ac', '進行中:bd', '完了:'])
    expect(after({ type: 'cardMoved', cardId: 13, toListId: 1, toIndex: 0 })).toEqual(['ToDo:cab', '進行中:d', '完了:'])
    expect(after({ type: 'cardMoved', cardId: 11, toListId: 3, toIndex: 0 })).toEqual(['ToDo:bc', '進行中:d', '完了:a'])
    expect(after({ type: 'cardMoved', cardId: 11, toListId: 2, toIndex: Number.MAX_SAFE_INTEGER })).toEqual(['ToDo:bc', '進行中:da', '完了:'])
  })

  test('移動：ないカードなら、何も変わらない', () => {
    expect(after({ type: 'cardMoved', cardId: 999, toListId: 2, toIndex: 0 })).toEqual(['ToDo:abc', '進行中:d', '完了:'])
  })

  test('場所を調べる', () => {
    expect(findCardPlace(board, 13)).toEqual({ listId: 1, index: 2 })
    expect(findCardPlace(board, 999)).toBe(null)
  })
})

describe('全体', () => {
  test('元のボードを書き換えない', () => {
    const before = structuredClone(board)
    after({ type: 'cardMoved', cardId: 11, toListId: 2, toIndex: 0 })
    after({ type: 'cardDeleted', cardId: 11 })
    after({ type: 'listRenamed', listId: 1, title: 'x' })
    expect(board).toEqual(before)
  })

  test('読み込む前（null）は、読み込み以外では変わらない', () => {
    const empty: BoardState = null
    expect(boardReducer(empty, { type: 'cardDeleted', cardId: 1 })).toBe(null)
    expect(boardReducer(empty, { type: 'listAdded', list: board.lists[0] })).toBe(null)
    expect(boardReducer(empty, { type: 'loaded', board })).toBe(board)
  })
})
