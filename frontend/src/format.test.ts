import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { dueDateStatus, formatDueDate } from './format.ts'

// テストの間だけ、今日を 2026年11月25日（夜の23時半）にする
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 10, 25, 23, 30))
})
afterEach(() => {
  vi.useRealTimers()
})

describe('期限の表示（F-11）', () => {
  test('今年なら 月/日（頭の 0 は付けない）', () => {
    expect(formatDueDate('2026-11-25')).toBe('11/25')
    expect(formatDueDate('2026-01-05')).toBe('1/5')
  })

  test('今年でなければ 年/月/日', () => {
    expect(formatDueDate('2027-01-05')).toBe('2027/1/5')
    expect(formatDueDate('2025-12-31')).toBe('2025/12/31')
  })
})

describe('期限の状態（F-11）', () => {
  test('今日・過ぎた・それ以外', () => {
    expect(dueDateStatus('2026-11-25')).toBe('today')
    expect(dueDateStatus('2026-11-24')).toBe('overdue')
    expect(dueDateStatus('2026-11-26')).toBe('normal')
  })

  test('月や年をまたいでも正しい', () => {
    expect(dueDateStatus('2026-09-30')).toBe('overdue')
    expect(dueDateStatus('2027-01-01')).toBe('normal')
  })
})
