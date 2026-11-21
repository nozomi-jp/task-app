// バックエンドの API を呼ぶ処理（要件定義書 10章）
import type { Board } from '../types.ts'

const CANNOT_CONNECT = 'サーバーに接続できません'

/**
 * API-01：ボード全体を読み込む。
 * 失敗したときは、画面に出す理由をメッセージにしたエラーを投げる。
 */
export async function fetchBoard(): Promise<Board> {
  let response: Response
  try {
    response = await fetch('/api/board')
  } catch {
    // サーバーに届かなかった（ネットワークのエラー）
    throw new Error(CANNOT_CONNECT)
  }
  // 502〜504：開発中にバックエンドが止まっていると、中継役（Vite）がこれを返す
  if ([502, 503, 504].includes(response.status)) {
    throw new Error(CANNOT_CONNECT)
  }
  if (!response.ok) {
    throw new Error(`サーバーがエラーを返しました（${response.status}）`)
  }
  return (await response.json()) as Board
}
