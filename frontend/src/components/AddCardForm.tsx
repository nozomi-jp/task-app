import { useState, type KeyboardEvent } from 'react'

/** カードの文字数の上限（要件定義書 6.1） */
const MAX_CARD_LENGTH = 200

/**
 * リストの下の「+ カードを追加」と、カードの入力欄（F-05、SC-01-b）。
 * - Enter で追加する。追加したあとも入力欄は開いたまま（続けて入力できる）
 * - Esc、または入力欄の外をクリックすると、やめる
 * - 空欄（空白だけを含む）は追加しない
 */
export default function AddCardForm({ onAdd }: { onAdd: (text: string) => Promise<boolean> }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  function close() {
    setOpen(false)
    setText('')
  }

  async function submit() {
    const trimmed = text.trim()
    if (trimmed === '' || saving) return
    setSaving(true)
    const ok = await onAdd(trimmed)
    setSaving(false)
    // 成功したら入力欄を空にして、続けて入力できるようにする。失敗したら文字を残す
    if (ok) setText('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // 日本語入力で変換を確定するための Enter では追加しない
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter') {
      e.preventDefault()
      void submit()
    } else if (e.key === 'Escape') {
      close()
    }
  }

  if (!open) {
    return (
      <button type="button" className="add-card" onClick={() => setOpen(true)}>
        + カードを追加
      </button>
    )
  }

  return (
    <div className="input-new-card">
      <input
        className="input"
        type="text"
        placeholder="カードの内容を入力"
        maxLength={MAX_CARD_LENGTH}
        value={text}
        autoFocus
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={close}
      />
      <p className="hint">Enterで追加 ／ Escでやめる</p>
    </div>
  )
}
