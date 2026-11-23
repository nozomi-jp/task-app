import { describe, expect, test } from 'vitest'
import { currentDirection } from './sort.ts'
import { testCard } from './testCard.ts'
import type { Priority } from './types.ts'

const byDueDate = (...dueDates: (string | null)[]) =>
  currentDirection(
    dueDates.map((dueDate) => testCard({ dueDate })),
    'dueDate',
  )
const byPriority = (...priorities: (Priority | null)[]) =>
  currentDirection(
    priorities.map((priority) => testCard({ priority })),
    'priority',
  )

describe('今どの順に並んでいるか（F-13）', () => {
  test('期限：近い順・遠い順・どちらでもない', () => {
    expect(byDueDate('2026-11-20', '2026-11-30', '2027-01-01')).toBe('forward')
    expect(byDueDate('2027-01-01', '2026-11-30', '2026-11-20')).toBe('reverse')
    expect(byDueDate('2026-11-30', '2026-11-20', '2027-01-01')).toBe(null)
  })

  test('優先度：高い順・低い順', () => {
    expect(byPriority('high', 'medium', 'low')).toBe('forward')
    expect(byPriority('low', 'medium', 'high')).toBe('reverse')
  })

  test('付けていないカードは、一番下ならよい。上にまざっていれば、並んでいない', () => {
    expect(byPriority('high', 'low', null, null)).toBe('forward')
    expect(byPriority('low', 'high', null)).toBe('reverse')
    expect(byPriority('high', null, 'low')).toBe(null)
  })

  test('同じ値がまざっていてもよい', () => {
    expect(byPriority('high', 'high', 'low')).toBe('forward')
  })

  test('値が1種類以下なら、向きは決まらない', () => {
    expect(byPriority()).toBe(null)
    expect(byPriority('medium', 'medium')).toBe(null)
    expect(byDueDate('2026-11-20', null)).toBe(null)
  })
})
