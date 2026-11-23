// カードの検索（F-15）。画面が持っているカードの中から探す（API は呼ばない）。
import type { Card } from './types.ts'

/** 比べやすい形にする。全角と半角（NFKC）、大文字と小文字を区別しないようにそろえる */
function normalize(text: string): string {
  return text.normalize('NFKC').toLowerCase()
}

/** 検索の欄の文字を、空白（全角も）で区切った言葉に分ける。何も入力していなければ空 */
export function parseWords(query: string): string[] {
  return normalize(query)
    .split(/\s+/)
    .filter((word) => word !== '')
}

/** カードのタイトルか説明に、全部の言葉が入っているか。言葉がなければ（検索していなければ）いつも合う */
export function matchesSearch(card: Card, words: string[]): boolean {
  const text = normalize(`${card.text}\n${card.description ?? ''}`)
  return words.every((word) => text.includes(word))
}
