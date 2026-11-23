import { useEffect, useRef, useState } from 'react'

/**
 * 「ボタンを押すと、その場所が入力欄に変わる」の切り替え（リストの追加・名前変更）。
 * close(true) で閉じると、ボタンに戻る（キーボードで続けて操作できるように、NFR-10）。
 */
export function useEditMode() {
  const [editing, setEditing] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const returnToButton = useRef(false)

  useEffect(() => {
    if (editing || !returnToButton.current) return
    returnToButton.current = false
    buttonRef.current?.focus()
  }, [editing])

  return {
    editing,
    buttonRef,
    open: () => setEditing(true),
    close: (byKey: boolean) => {
      returnToButton.current = byKey
      setEditing(false)
    },
  }
}
