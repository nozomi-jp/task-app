import type { SaveResult } from '../types.ts'
import ListTitleInput from './ListTitleInput.tsx'
import { useEditMode } from './useEditMode.ts'

/** リストの並びの最後の「+ リストを追加」（F-02）。押すと、その場所が入力欄に変わる */
export default function AddList({ onAddList }: { onAddList: (title: string) => Promise<SaveResult> }) {
  const { editing, buttonRef, open, close } = useEditMode()

  if (!editing) {
    return (
      <button ref={buttonRef} type="button" className="add-list" onClick={open}>
        + リストを追加
      </button>
    )
  }
  return (
    <div className="list">
      <ListTitleInput label="リスト名を入力" initial="" saveOnBlur={false} onSave={onAddList} onClose={close} />
    </div>
  )
}
