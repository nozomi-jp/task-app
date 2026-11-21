// カードについての API（要件定義書 10章）
import type { Card } from '../types.ts'
import { requestJson } from './client.ts'

/**
 * API-05：カードをリストの一番下に追加する（登録なので POST）。
 * 成功するとサーバーは 201 と、追加したカード（データベースが決めた id 付き）を返す。
 */
export function createCard(listId: number, text: string): Promise<Card> {
  return requestJson<Card>(`/api/lists/${listId}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
}
