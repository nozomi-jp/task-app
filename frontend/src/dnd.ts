// ドラッグ＆ドロップ（dnd-kit）で使う、名前（id）の作り方・読み方と、置く場所の決め方（F-08・F-09）
// カードとリストの数の id が同じになることがあるので、"card-12"・"list-3" のように種類を付けて区別する。
import { closestCorners, pointerWithin, type CollisionDetection } from '@dnd-kit/core'

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

/**
 * つかんでいるカードを、今どこに置けるかを決める。
 * - マウスがどのリストの中にもない → どこにも置けない（離すと元の場所に戻る。F-08）
 * - カードの上 → そのカードの所
 * - リストの中だがカードの上ではない → カードより下（またはカードが1枚もない）ならリストの一番下、それ以外はいちばん近いカードの所
 * - キーボードで動かしているとき（マウスの位置がない）→ いちばん近い所
 *
 * closestCorners だけだと、リストからどれだけ離れていても「いちばん近い所」に置けてしまう。
 */
export const detectDropTarget: CollisionDetection = (args) => {
  const { pointerCoordinates, droppableContainers, droppableRects } = args
  if (pointerCoordinates === null) return closestCorners(args)

  const hits = pointerWithin(args)
  const list = hits.find((hit) => parseDragId(hit.id)?.kind === 'list')
  if (list === undefined) return []
  const card = hits.find((hit) => parseDragId(hit.id)?.kind === 'card')
  if (card !== undefined) return [card]

  // そのリストの中にあるカード（カードの中心がリストの枠の中にあるもの）
  const listRect = droppableRects.get(list.id)
  if (listRect === undefined) return [list]
  const cards = droppableContainers.filter((container) => {
    const rect = droppableRects.get(container.id)
    if (rect === undefined || parseDragId(container.id)?.kind !== 'card') return false
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    return x >= listRect.left && x <= listRect.right && y >= listRect.top && y <= listRect.bottom
  })
  const bottom = Math.max(...cards.map((container) => droppableRects.get(container.id)?.bottom ?? -Infinity))
  if (cards.length === 0 || pointerCoordinates.y > bottom) return [list]
  return closestCorners({ ...args, droppableContainers: cards })
}
