import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import type { SaveResult } from '../types.ts'

/** リスト名の文字数の上限（要件定義書 6.1） */
const MAX_TITLE_LENGTH = 20

/**
 * リスト名の入力欄（SC-01-a）。リストの追加（F-02）と名前変更（F-03）で使う。
 * - Enter で確定（日本語入力の変換を決める Enter では確定しない）。保存に失敗したら、入力を残す
 * - Esc でやめる。入力欄の外を押したときは、追加なら「やめる」、名前変更なら「確定」（saveOnBlur）。
 *   ほかのアプリに切り替えただけなら、何もしない
 * - 空・空白だけで確定したとき：追加なら何もしない、名前変更なら元の名前に戻す
 */
export default function ListTitleInput({
  label,
  initial,
  saveOnBlur,
  onSave,
  onClose,
}: {
  label: string
  /** 最初に入っている名前。追加のときは空 */
  initial: string
  saveOnBlur: boolean
  onSave: (title: string) => Promise<SaveResult>
  /** 入力欄を閉じる。byKey はキーボード（Enter・Esc）で閉じたか */
  onClose: (byKey: boolean) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(initial)
  const finished = useRef(false) // 保存中か、もう閉じたか。続けて押されても受け付けない（連打でもすぐ効くように ref にする）

  // すぐ打てるようにする。名前変更なら、今の名前を全部選んでおく
  useEffect(() => {
    input.current?.focus()
    input.current?.select()
  }, [])

  function close(byKey: boolean) {
    finished.current = true
    onClose(byKey)
  }

  async function confirm(byKey: boolean) {
    const newTitle = title.trim()
    if (finished.current || (newTitle === '' && initial === '')) return
    if (newTitle === '' || newTitle === initial) {
      close(byKey)
      return
    }
    finished.current = true
    const error = await onSave(newTitle)
    if (error === null) close(byKey)
    else finished.current = false
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter') {
      e.preventDefault()
      void confirm(true)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close(true)
    }
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    const onlyWindow = document.activeElement === e.currentTarget // ほかのアプリに切り替えただけ
    if (finished.current || onlyWindow) return
    if (saveOnBlur) void confirm(false)
    else close(false)
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
