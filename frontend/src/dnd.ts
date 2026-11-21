// ドラッグ＆ドロップ（dnd-kit）で使う名前（id）の作り方と読み方（F-08・F-09）
// カードとリストの数の id が同じになることがあるので、"card-12"・"list-3" のように種類を付けて区別する。

/** カードの名前 */
export function cardDragId(cardId: number): string {
  return `card-${cardId}`
}

/** リスト（カードを置ける場所）の名前 */
export function listDragId(listId: number): string {
  return `list-${listId}`
}

/** 名前から、種類と数の id を取り出す。読めなければ null */
export function parseDragId(id: string | number): { kind: 'card' | 'list'; id: number } | null {
  const match = /^(card|list)-(\d+)$/.exec(String(id))
  return match ? { kind: match[1] as 'card' | 'list', id: Number(match[2]) } : null
}
