import type { Card } from './types.ts'

/** テストで使うカードを作る。書かなかった項目は「なし」（id は 0） */
export function testCard(values: Partial<Card>): Card {
  return { id: 0, text: 'カード', description: null, dueDate: null, priority: null, label: null, ...values }
}
