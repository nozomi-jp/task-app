// API でやりとりするデータの形（型）。要件定義書 10章の API-01 の返事と同じ形。
// 型を書いておくと、名前の書き間違い（dueDate を duedate と書くなど）を、動かす前に見つけられる。

/** 優先度。API では英語の3つのどれか。なければ null */
export type Priority = 'high' | 'medium' | 'low'

/** カード（タスク） */
export type Card = {
  id: number
  text: string
  /** 期限。"2026-11-25" の形の文字。なければ null */
  dueDate: string | null
  priority: Priority | null
}

/** リスト。カードは上から並び順どおり */
export type TaskList = {
  id: number
  title: string
  cards: Card[]
}

/** ボード全体（API-01 GET /api/board の返事）。リストは左から並び順どおり */
export type Board = {
  lists: TaskList[]
}
