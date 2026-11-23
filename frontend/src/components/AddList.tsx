import { useEffect, useRef, useState } from 'react'
import type { SaveResult } from '../types.ts'
import ListTitleInput from './ListTitleInput.tsx'

/** リストの並びの最後の「+ リストを追加」（F-02）。押すと、その場所が入力欄に変わる */
export default function AddList({ onAddList }: { onAddList: (title: string) => Promise<SaveResult> }) {
  const [adding, setAdding] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef(false) // 閉じたあと、ボタンに戻るか（キーボードで続けて操作できるように、NFR-10）

  useEffect(() => {
    if (adding || !returnFocus.current) return
    returnFocus.current = false
    button.current?.focus()
  }, [adding])

  function close(returnToButton: boolean) {
    returnFocus.current = returnToButton
    setAdding(false)
  }

  async function handleConfirm(title: string): Promise<SaveResult> {
    const error = await onAddList(title)
    if (error === null) close(true)
    return error
  }

  if (!adding) {
    return (
      <button ref={button} type="button" className="add-list" onClick={() => setAdding(true)}>
        + リストを追加
      </button>
    )
  }
  return (
    <div className="list">
      <ListTitleInput
        label="リスト名を入力"
        onConfirm={handleConfirm}
        onCancel={(reason) => close(reason === 'esc')}
      />
    </div>
  )
}
