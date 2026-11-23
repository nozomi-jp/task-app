// リストについての API（要件定義書 10章）
import type { SortKey, TaskList } from '../types.ts'
import { requestJson } from './client.ts'

/**
 * API-09：リストの中のカードを並べ替える。並べ替えたあとのリスト（カードを並び順どおりに含む）が返る。
 * reverse が false なら期限が近い順・優先度が高い順、true ならその反対。
 */
export function sortCards(listId: number, by: SortKey, reverse: boolean): Promise<TaskList> {
  return requestJson<TaskList>(`/api/lists/${listId}/sort`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ by, reverse }),
  })
}
