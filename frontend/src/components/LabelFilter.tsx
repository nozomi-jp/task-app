import { LABELS, LABEL_NAMES } from '../format.ts'
import type { Label } from '../types.ts'

/**
 * ラベルの色で絞り込むボタン（F-16、SC-01-i）。色の丸を押すと、その色のカードだけになる。
 * 選んでいる色をもう一度押すと、絞り込みをやめる。文字の検索（F-15）と組み合わせられる。
 */
export default function LabelFilter({
  selected,
  onChange,
}: {
  selected: Label | null
  onChange: (label: Label | null) => void
}) {
  return (
    <fieldset className="label-filter" aria-label="ラベルの色で絞り込む">
      {LABELS.map((label) => {
        const pressed = selected === label
        return (
          <button
            key={label}
            type="button"
            className={pressed ? 'label-btn current' : 'label-btn'}
            aria-label={`${LABEL_NAMES[label]}のカードだけにする`}
            aria-pressed={pressed}
            title={pressed ? '絞り込みをやめる' : `${LABEL_NAMES[label]}のカードだけにする`}
            onClick={() => onChange(pressed ? null : label)}
          >
            <span className={`swatch label-${label}`} />
          </button>
        )
      })}
    </fieldset>
  )
}
