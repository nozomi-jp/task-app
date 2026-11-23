// カードについての API（要件定義書 10章）
// 検索は GET、登録は POST、更新は PATCH（中身の一部を変える）・PUT（位置を置き換える）、削除は DELETE
import type { Card, CardUpdate, NewCard } from '../types.ts'
import { requestJson, requestNoContent } from './client.ts'

/**
 * API-05：カードをリストの一番下に追加する（登録なので POST）。
 * position（0始まり）を渡すと、その場所に入れる（消したカードを元に戻すとき）。
 * 成功するとサーバーは 201 と、追加したカード（データベースが決めた id 付き）を返す。
 */
export function createCard(listId: number, newCard: NewCard, position?: number): Promise<Card> {
  const { text, description, priority, dueDate, label } = newCard
  return requestJson<Card>(`/api/lists/${listId}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, description, priority, dueDate, label, position }),
  })
}

/**
 * API-06：カードの内容（タイトル・説明・優先度・期限・ラベル）とステータスを、まとめて更新する（PATCH）。
 * ステータス（listId）が変わっていれば、そのリストの一番下へ移る。全部保存されるか、何も変わらないかのどちらか。
 */
export function updateCard(cardId: number, update: CardUpdate): Promise<Card> {
  return requestJson<Card>(`/api/cards/${cardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  })
}

/** API-07：カードを削除する（DELETE）。データベースから行ごとなくなる。成功すると 204 で、返事の中身はない */
export function deleteCard(cardId: number): Promise<void> {
  return requestNoContent(`/api/cards/${cardId}`, { method: 'DELETE' })
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
