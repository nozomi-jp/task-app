// カードの検索（F-15）と、ラベルの色での絞り込み（F-16）。画面が持っているカードの中から探す（API は呼ばない）。
import type { Card, Label } from './types.ts'

/** 絞り込みの条件。検索の言葉（なければ空）と、ラベルの色（選んでいなければ null） */
export type SearchFilter = {
  words: string[]
  label: Label | null
}

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

/** 絞り込んでいるか */
export function isFiltering({ words, label }: SearchFilter): boolean {
  return words.length > 0 || label !== null
}

/** カードのタイトルか説明に全部の言葉が入っていて、ラベルの色も同じか。条件がなければ（絞り込んでいなければ）いつも合う */
export function matchesSearch(card: Card, { words, label }: SearchFilter): boolean {
  if (label !== null && card.label !== label) return false
  const text = normalize(`${card.text}\n${card.description ?? ''}`)
  return words.every((word) => text.includes(word))
}
