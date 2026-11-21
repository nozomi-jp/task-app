// カードについての API（要件定義書 10章）
// 検索は GET、登録は POST、更新は PATCH（中身の一部を変える）・PUT（位置を置き換える）
import type { Card, CardUpdate, NewCard } from '../types.ts'
import { requestJson } from './client.ts'

/**
 * API-05：カードをリストの一番下に追加する（登録なので POST）。
 * 成功するとサーバーは 201 と、追加したカード（データベースが決めた id 付き）を返す。
 */
export function createCard(listId: number, newCard: NewCard): Promise<Card> {
  return requestJson<Card>(`/api/lists/${listId}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newCard),
  })
}

/** API-06：カードの内容（タイトル・説明・優先度・期限）を更新する（PATCH）。更新したあとのカードが返る */
export function updateCard(cardId: number, update: CardUpdate): Promise<Card> {
  return requestJson<Card>(`/api/cards/${cardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  })
}

/**
 * API-08：カードを、指定したリストの指定した位置（0始まり）へ移す（PUT）。
 * ステータスの変更・移動・並べ替えに使う。position がカードの数より大きければ一番下に置かれる。
 */
export function moveCard(cardId: number, listId: number, position: number): Promise<Card> {
  return requestJson<Card>(`/api/cards/${cardId}/position`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listId, position }),
  })
}
