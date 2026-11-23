// API でやりとりするデータの形（型）。要件定義書 10章の API-01 の返事と同じ形。
// 型を書いておくと、名前の書き間違い（dueDate を duedate と書くなど）を、動かす前に見つけられる。

/** 優先度。API では英語の3つのどれか。なければ null */
export type Priority = 'high' | 'medium' | 'low'

/** ラベルの色。API では英語の6つのどれか。なければ null */
export type Label = 'green' | 'sky' | 'blue' | 'purple' | 'pink' | 'gray'

/** カード（タスク） */
export type Card = {
  id: number
  text: string
  /** 説明。改行を含んでよい。なければ null */
  description: string | null
  /** 期限。"2026-11-25" の形の文字。なければ null */
  dueDate: string | null
  priority: Priority | null
  label: Label | null
}

/** リスト。カードは上から並び順どおり */
export type TaskList = {
  id: number
  title: string
  cards: Card[]
}

/** カードを登録するときに送るもの（API-05 POST）。タイトル以外はなくてもよい（null） */
export type NewCard = {
  text: string
  description: string | null
  priority: Priority | null
  dueDate: string | null
  label: Label | null
}

/** 消したカード。元に戻すために、中身と、消したときの場所（リストと、上から何番目か）を覚えておく（F-14） */
export type DeletedCard = {
  card: Card
  listId: number
  index: number
  /** 消した時刻（Ctrl + Z で、いちばん新しくしたことから戻すために比べる） */
  deletedAt: number
}

/** カードを更新するときに送るもの（API-06 PATCH）。説明・優先度・期限・ラベルは null で「なし」にする。listId はステータス（移す先のリスト） */
export type CardUpdate = CardFormValues

/** 並べ替えの種類（F-13）。dueDate：期限、priority：優先度 */
export type SortKey = 'dueDate' | 'priority'

/** 登録・詳細のダイアログで入力する値。listId はステータス（どのリストに入れるか） */
export type CardFormValues = NewCard & { listId: number }

/** 保存の結果。うまくいったら null、失敗したら画面に出す理由 */
export type SaveResult = string | null

/** ボード全体（API-01 GET /api/board の返事）。リストは左から並び順どおり */
export type Board = {
  lists: TaskList[]
}
