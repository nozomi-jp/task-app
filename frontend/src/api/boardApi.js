// バックエンドの API を呼ぶ処理（要件定義書 10章）

const CANNOT_CONNECT = 'サーバーに接続できません'

/**
 * API-01：ボード全体を読み込む。
 * 返事の形：{ lists: [{ id, title, cards: [{ id, text, dueDate, priority }] }] }
 * 失敗したときは、画面に出す理由をメッセージにしたエラーを投げる。
 */
export async function fetchBoard() {
  let response
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
  return response.json()
}
