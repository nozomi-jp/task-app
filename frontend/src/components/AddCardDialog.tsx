import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type MouseEvent } from 'react'
import type { NewCard, Priority } from '../types.ts'

/** 文字数の上限（要件定義書 6.1） */
const MAX_TITLE_LENGTH = 200
const MAX_DESCRIPTION_LENGTH = 1000

const PRIORITY_CHOICES: { value: Priority; label: string }[] = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
]

/**
 * カードを追加するダイアログ（F-05、SC-01-b）。
 * - 入力：タイトル（必須）、説明、優先度（最初は「中」）、期限日
 * - 「保存」、またはタイトルの欄で Enter → 登録する。うまくいったら親がダイアログを閉じる
 *   （日本語入力で変換を確定するための Enter では登録しない）
 * - タイトルが空（空白だけを含む）のあいだは保存できない
 * - 「キャンセル」・Esc・ダイアログの外をクリック → 登録せずに閉じる
 * - 保存に失敗したときは閉じずに、入力した内容を残す
 */
export default function AddCardDialog({
  listTitle,
  onSave,
  onClose,
}: {
  listTitle: string
  /** 保存できたら true を返す */
  onSave: (newCard: NewCard) => Promise<boolean>
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  // ブラウザ標準のダイアログとして開く（後ろが暗くなり、後ろの画面は操作できなくなる）
  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  const canSave = title.trim() !== '' && !saving

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    const ok = await onSave({
      text: title.trim(),
      description: description.trim() === '' ? null : description,
      priority,
      dueDate: dueDate === '' ? null : dueDate,
    })
    setSaving(false)
    if (ok) onClose()
  }

  // 日本語入力で変換を確定するための Enter では、フォームを送らない
  function preventSubmitWhileComposing(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && e.nativeEvent.isComposing) e.preventDefault()
  }

  // ダイアログの外（暗い部分）をクリックしたら閉じる。ダイアログの中のクリックは中の要素に届くので、ここには来ない
  function handleBackdropClick(e: MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby="add-card-title"
      onCancel={(e) => {
        // Esc キー。ブラウザに閉じさせず、親に閉じてもらう
        e.preventDefault()
        onClose()
      }}
      onClick={handleBackdropClick}
    >
      <form className="dialog-body" onSubmit={handleSubmit}>
        <h2 id="add-card-title" className="dialog-title">
          タスクを追加<span className="dialog-sub">（{listTitle}）</span>
        </h2>

        <label className="field">
          <span className="field-label">
            タイトル<span className="required">*</span>
          </span>
          <input
            className="input"
            type="text"
            placeholder="タスク名を入力"
            maxLength={MAX_TITLE_LENGTH}
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={preventSubmitWhileComposing}
          />
        </label>

        <label className="field">
          <span className="field-label">説明</span>
          <textarea
            className="input textarea"
            placeholder="タスクの説明を入力"
            rows={3}
            maxLength={MAX_DESCRIPTION_LENGTH}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <fieldset className="field">
          <legend className="field-label">優先度</legend>
          <div className="radio-row">
            {PRIORITY_CHOICES.map((choice) => (
              <label key={choice.value} className="radio">
                <input
                  type="radio"
                  name="priority"
                  value={choice.value}
                  checked={priority === choice.value}
                  onChange={() => setPriority(choice.value)}
                />
                {choice.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="field">
          <span className="field-label">期限日</span>
          <input
            className="input"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            onKeyDown={preventSubmitWhileComposing}
          />
        </label>

        <p className="hint">タイトルの欄で Enter を押しても保存できます</p>

        <div className="dialog-buttons">
          <button type="button" className="button" onClick={onClose}>
            キャンセル
          </button>
          <button type="submit" className="button primary" disabled={!canSave}>
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
