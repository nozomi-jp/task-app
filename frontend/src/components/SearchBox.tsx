import type { KeyboardEvent, Ref } from 'react'

/**
 * カードを検索する欄（F-15、SC-01-h）。打つたびに onChange を呼ぶ。Esc か「×」で検索（ラベルの絞り込みも）をやめる。
 * Ctrl + F でこの欄に移るのは App が行う（欄の中の Ctrl + F は、ブラウザの検索のまま）。
 */
export default function SearchBox({
  inputRef,
  query,
  count,
  onChange,
  onClear,
}: {
  inputRef: Ref<HTMLInputElement>
  query: string
  /** 見つかった枚数。検索していなければ null */
  count: number | null
  onChange: (query: string) => void
  /** 検索をやめる（ラベルの絞り込みも） */
  onClear: () => void
}) {
  // 日本語入力の変換をやめる Esc では、検索をやめない
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Escape' || e.nativeEvent.isComposing) return
    e.preventDefault()
    onClear()
    e.currentTarget.blur()
  }

  return (
    <>
      <span className="search-field">
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          placeholder="🔍 カードを検索（Ctrl + F）"
          aria-label="カードを検索"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {count !== null && (
          <button type="button" className="search-clear" aria-label="検索をやめる" title="検索をやめる（Esc）" onClick={onClear}>
            ×
          </button>
        )}
      </span>
      <output className="search-count">{count !== null && `${count}枚`}</output>
    </>
  )
}
