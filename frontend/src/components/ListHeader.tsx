import type { SaveResult, SortKey, TaskList } from '../types.ts'
import ListTitleInput from './ListTitleInput.tsx'
import SortButtons from './SortButtons.tsx'
import { useEditMode } from './useEditMode.ts'

/**
 * リストの上の段。リスト名、並べ替えのボタン（F-13）、削除の「×」（F-04）。
 * リスト名を押すと、その場で入力欄に変わり、名前を変えられる（F-03）。
 * 入力している間は、入力欄を広く使えるように、並べ替えのボタンと「×」を隠す。
 */
export default function ListHeader({
  list,
  onRename,
  onDelete,
  onSort,
}: {
  list: TaskList
  onRename: (title: string) => Promise<SaveResult>
  /** リストを削除する。null なら「×」を出さない */
  onDelete: (() => void) | null
  onSort: (by: SortKey, reverse: boolean) => Promise<void>
}) {
  const { editing, buttonRef, open, close } = useEditMode()

  if (editing) {
    return (
      <div className="list-header">
        <ListTitleInput label="リスト名" initial={list.title} saveOnBlur onSave={onRename} onClose={close} />
      </div>
    )
  }
  return (
    <div className="list-header">
      <h2 className="list-title">
        <button ref={buttonRef} type="button" className="list-title-btn" title="押すと名前を変えられます" onClick={open}>
          {list.title}
        </button>
      </h2>
      <SortButtons cards={list.cards} onSort={onSort} />
      {onDelete && (
        <button type="button" className="list-delete" aria-label={`リスト「${list.title}」を削除`} title="リストを削除" onClick={onDelete}>
          ×
        </button>
      )}
    </div>
  )
}
