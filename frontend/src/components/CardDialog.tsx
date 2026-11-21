import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type MouseEvent } from 'react'
import type { CardFormValues, Priority } from '../types.ts'

/** 文字数の上限（要件定義書 6.1） */
const MAX_TITLE_LENGTH = 200
const MAX_DESCRIPTION_LENGTH = 1000

const PRIORITY_CHOICES: { value: Priority; label: string }[] = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
]

/**
 * カードの登録・詳細（更新）に使うダイアログ（F-05・F-06、SC-01-b）。
 * - 入力：タイトル（必須）、説明、優先度、期限日。lists を渡すとステータス（どのリストに入れるか）も選べる
 * - 「保存」、またはタイトルの欄で Enter → 保存する。うまくいったら閉じる
 *   （日本語入力で変換を確定するための Enter では保存しない）
 * - タイトルが空（空白だけを含む）のあいだは保存できない
 * - 「キャンセル」・Esc・ダイアログの外をクリック → 保存せずに閉じる
 * - 保存に失敗したときは閉じずに、入力した内容を残す
 */
export default function CardDialog({
  heading,
  subheading,
  initial,
  allowNoPriority,
  lists,
  onSave,
  onClose,
}: {
  /** 見出し（「タスクを追加」「タスクの詳細」） */
  heading: string
  /** 見出しの横に小さく出す文字（リスト名など） */
  subheading?: string
  /** 最初に入っている値 */
  initial: CardFormValues
  /** 優先度に「なし」を選べるようにするか（詳細画面では選べる） */
  allowNoPriority: boolean
  /** ステータスとして選べるリスト。渡さなければステータスの欄は出さない */
  lists?: { id: number; title: string }[]
  /** 保存できたら true を返す */
  onSave: (values: CardFormValues) => Promise<boolean>
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [title, setTitle] = useState(initial.text)
  const [description, setDescription] = useState(initial.description ?? '')
  const [priority, setPriority] = useState<Priority | null>(initial.priority)
  const [dueDate, setDueDate] = useState(initial.dueDate ?? '')
  const [listId, setListId] = useState(initial.listId)
  const [saving, setSaving] = useState(false)

  // ブラウザ標準のダイアログとして開く（後ろが暗くなり、後ろの画面は操作できなくなる）
  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  const canSave = title.trim() !== '' && !saving
  const priorityChoices = allowNoPriority
    ? [...PRIORITY_CHOICES, { value: null, label: 'なし' }]
    : PRIORITY_CHOICES

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    const ok = await onSave({
      text: title.trim(),
      description: description.trim() === '' ? null : description,
      priority,
      dueDate: dueDate === '' ? null : dueDate,
      listId,
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
      aria-labelledby="card-dialog-title"
      onCancel={(e) => {
        // Esc キー。ブラウザに閉じさせず、親に閉じてもらう
        e.preventDefault()
        onClose()
      }}
      onClick={handleBackdropClick}
    >
      <form className="dialog-body" onSubmit={handleSubmit}>
        <h2 id="card-dialog-title" className="dialog-title">
          {heading}
          {subheading && <span className="dialog-sub">（{subheading}）</span>}
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

        {lists && (
          <label className="field">
            <span className="field-label">ステータス</span>
            <select className="input" value={listId} onChange={(e) => setListId(Number(e.target.value))}>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.title}
                </option>
              ))}
            </select>
          </label>
        )}

        <fieldset className="field">
          <legend className="field-label">優先度</legend>
          <div className="radio-row">
            {priorityChoices.map((choice) => (
              <label key={choice.label} className="radio">
                <input
                  type="radio"
                  name="priority"
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
