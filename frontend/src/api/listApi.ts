// リストについての API（要件定義書 10章）
import type { SortKey, TaskList } from '../types.ts'
import { requestJson, requestNoContent } from './client.ts'

/** API-02：リストを一番最後（右）に追加する。追加したリスト（カードは0枚）が返る */
export function createList(title: string): Promise<TaskList> {
  return requestJson<TaskList>('/api/lists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
}

/** API-03：リストの名前を変える。変えたあとのリストが返る */
export function renameList(listId: number, title: string): Promise<TaskList> {
  return requestJson<TaskList>(`/api/lists/${listId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
}

/** API-04：リストを削除する（中のカードも）。成功すると 204 で、返事の中身はない */
export function deleteList(listId: number): Promise<void> {
  return requestNoContent(`/api/lists/${listId}`, { method: 'DELETE' })
}

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
