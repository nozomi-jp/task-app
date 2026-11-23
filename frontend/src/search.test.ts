import { describe, expect, test } from 'vitest'
import { isFiltering, matchesSearch, parseWords } from './search.ts'
import { testCard } from './testCard.ts'

const card = testCard({ text: 'りんごＡＢＣ', description: '赤い くだもの', label: 'green' })

/** 検索の欄に query と打ったとき、カードが合うか */
const matches = (query: string) => matchesSearch(card, { words: parseWords(query), label: null })

describe('検索の言葉（F-15）', () => {
  test('空白（全角も）で区切る。前後の空白は無視する', () => {
    expect(parseWords('  りんご　赤い ')).toEqual(['りんご', '赤い'])
  })

  test('空・空白だけなら、言葉なし', () => {
    expect(parseWords('')).toEqual([])
    expect(parseWords(' 　')).toEqual([])
  })
})

describe('カードが検索に合うか（F-15）', () => {
  test('タイトルと説明から探す', () => {
    expect(matches('りんご')).toBe(true)
    expect(matches('くだもの')).toBe(true)
    expect(matches('みかん')).toBe(false)
  })

  test('大文字と小文字、全角と半角を区別しない', () => {
    expect(matches('abc')).toBe(true)
    expect(matches('ａｂｃ')).toBe(true)
  })

  test('全部の言葉が入っているカードだけ合う', () => {
    expect(matches('りんご 赤い')).toBe(true)
    expect(matches('りんご 青い')).toBe(false)
  })

  test('記号は、そのままの文字として探す', () => {
    expect(matches('.*')).toBe(false)
    expect(matchesSearch(testCard({ text: 'a.*b' }), { words: parseWords('.*'), label: null })).toBe(true)
  })

  test('検索していなければ、いつも合う', () => {
    expect(matches('')).toBe(true)
  })
})

describe('ラベルの色で絞り込む（F-16）', () => {
  test('同じ色だけ合う。文字の検索とも組み合わせられる', () => {
    expect(matchesSearch(card, { words: [], label: 'green' })).toBe(true)
    expect(matchesSearch(card, { words: [], label: 'pink' })).toBe(false)
    expect(matchesSearch(card, { words: ['みかん'], label: 'green' })).toBe(false)
    expect(matchesSearch(testCard({}), { words: [], label: 'green' })).toBe(false)
  })

  test('言葉か色があれば、絞り込んでいる', () => {
    expect(isFiltering({ words: [], label: null })).toBe(false)
    expect(isFiltering({ words: ['a'], label: null })).toBe(true)
    expect(isFiltering({ words: [], label: 'gray' })).toBe(true)
  })
})
