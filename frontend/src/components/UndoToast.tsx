/**
 * カードを消した直後に、画面の左下に出す知らせ（F-14、SC-01-g）。「元に戻す」を押すと、消したカードが元の場所に戻る。
 * 出している時間は App が決める。消えたあとも Ctrl + Z で戻せる。
 */
export default function UndoToast({ cardText, onUndo }: { cardText: string; onUndo: () => void }) {
  return (
    <output className="toast">
      <span className="toast-text">「{cardText}」</span>
      <span className="toast-label">を削除しました</span>
      <button type="button" className="toast-btn" title="Ctrl + Z でも戻せます" onClick={onUndo}>
        元に戻す
      </button>
    </output>
  )
}
