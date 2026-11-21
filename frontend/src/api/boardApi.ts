// ボードについての API（要件定義書 10章）
import type { Board } from '../types.ts'
import { requestJson } from './client.ts'

/** API-01：ボード全体を読み込む（検索なので GET） */
export function fetchBoard(): Promise<Board> {
  return requestJson<Board>('/api/board')
}
