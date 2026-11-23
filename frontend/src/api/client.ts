// API を呼ぶときの共通の処理（要件定義書 10章）
// 失敗したときは、画面に出す「理由」をメッセージにしたエラーを投げる。

const CANNOT_CONNECT = 'サーバーに接続できません'

/**
 * API を呼ぶ。失敗したらエラーを投げる。
 * - サーバーに届かない、または 502〜504（開発中にバックエンドが止まっていると、中継役の Vite が返す）→「サーバーに接続できません」
 * - そのほかのエラー → バックエンドが返した {"error": "理由"} の理由。読めなければ状態コード
 */
async function request(url: string, init?: RequestInit): Promise<Response> {
  let response: Response
  try {
    response = await fetch(url, init)
  } catch {
    throw new Error(CANNOT_CONNECT)
  }
  if ([502, 503, 504].includes(response.status)) {
    throw new Error(CANNOT_CONNECT)
  }
  if (!response.ok) {
    throw new Error(await readErrorReason(response))
  }
  return response
}

/** API を呼び、返ってきた JSON を返す */
export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await request(url, init)
  return (await response.json()) as T
}

/** API を呼ぶ。成功しても返事の中身がないとき（204。削除など）に使う */
export async function requestNoContent(url: string, init?: RequestInit): Promise<void> {
  await request(url, init)
}

/** エラーの返事 {"error": "理由"} から理由を取り出す */
async function readErrorReason(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()
    if (body !== null && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
      return body.error
    }
  } catch {
    // JSON でなければ、下の決まった文にする
  }
  return `サーバーがエラーを返しました（${response.status}）`
}
