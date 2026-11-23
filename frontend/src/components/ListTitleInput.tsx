import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import type { SaveResult } from '../types.ts'

/** リスト名の文字数の上限（要件定義書 6.1） */
const MAX_TITLE_LENGTH = 20

/**
 * リスト名の入力欄（SC-01-a）。リストの追加（F-02）で使う。
 * - Enter で確定（空・空白だけなら何もしない。日本語入力の変換を決める Enter では確定しない）。保存に失敗したら、入力を残す
 * - Esc、または入力欄の外を押すと onCancel（ほかのアプリに切り替えただけなら、やめない）
 */
export default function ListTitleInput({
  label,
  onConfirm,
  onCancel,
}: {
  label: string
  onConfirm: (title: string) => Promise<SaveResult>
  onCancel: (reason: 'esc' | 'blur') => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const saving = useRef(false) // 保存が終わるまで、続けて押されても受け付けない（連打でもすぐ効くように ref にする）

  useEffect(() => input.current?.focus(), [])

  async function confirm() {
    if (saving.current || title.trim() === '') return
    saving.current = true
    const error = await onConfirm(title.trim())
    if (error !== null) saving.current = false
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter') {
      e.preventDefault()
      void confirm()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel('esc')
    }
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    const onlyWindow = document.activeElement === e.currentTarget // ほかのアプリに切り替えただけ
    if (!saving.current && !onlyWindow) onCancel('blur')
  }

  return (
    <input
      ref={input}
      className="list-title-input"
      type="text"
      aria-label={label}
      placeholder={label}
      maxLength={MAX_TITLE_LENGTH}
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  )
}
