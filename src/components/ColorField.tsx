import { ChangeEvent, useEffect, useState } from 'react'
import { ColorFieldProps } from '../types/ui'
import { fieldBase, fieldInvalid, fieldLabel, fieldValid } from '../styles/field'
import { normalizeHexColor } from '../utils/hexColor'

function ColorField ({ id, label, color, onChange, hint }: ColorFieldProps) {
  const hintId = `${id}-hint`
  const describedBy = hint ? hintId : undefined
  const [draft, setDraft] = useState<string>(color)
  const swatchColor = normalizeHexColor(color) ?? '#000000'
  const isDraftValid = normalizeHexColor(draft) !== null

  useEffect(() => {
    // Only external changes overwrite the draft: typing "#3f6" on the way to "#3f6212" must not jump to "#33ff66"
    setDraft((current) => normalizeHexColor(current) === color ? current : color)
  }, [color])

  const onSwatchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  const onDraftChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
    setDraft(raw)

    const normalized = normalizeHexColor(raw)
    if (normalized) {
      onChange(normalized)
    }
  }

  const onDraftBlur = () => {
    setDraft(color)
  }

  return (
    <div className='flex items-center justify-between gap-4'>
      <div className='min-w-0'>
        <label htmlFor={id} className={fieldLabel}>
          {label}
        </label>
        {hint && (
          <p id={hintId} className='text-xs text-muted'>
            {hint}
          </p>
        )}
      </div>
      <div className='flex shrink-0 items-center gap-3'>
        <input
          type='color'
          aria-label={`${label} swatch`}
          className='qr-swatch'
          value={swatchColor}
          onChange={onSwatchChange}
          aria-describedby={describedBy}
        />
        <div className='w-24'>
          <input
            id={id}
            type='text'
            spellCheck={false}
            autoComplete='off'
            maxLength={7}
            className={`${fieldBase} ${isDraftValid ? fieldValid : fieldInvalid} uppercase`}
            value={draft}
            onChange={onDraftChange}
            onBlur={onDraftBlur}
            aria-invalid={!isDraftValid}
            aria-describedby={describedBy}
          />
        </div>
      </div>
    </div>
  )
}

export default ColorField
