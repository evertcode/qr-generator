import { ChangeEvent, useEffect, useState } from 'react'
import { ColorFieldProps } from '../types/ui'
import { fieldBase, fieldInvalid, fieldLabel, fieldValid } from '../styles/field'
import { normalizeHexColor } from '../utils/hexColor'

function ColorField ({ id, label, color, onChange }: ColorFieldProps) {
  const [draft, setDraft] = useState<string>(color)
  const swatchColor = normalizeHexColor(color) ?? '#000000'
  const isDraftValid = normalizeHexColor(draft) !== null

  useEffect(() => {
    setDraft(color)
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
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <div className='flex items-center gap-3'>
        <input
          type='color'
          aria-label={`${label} swatch`}
          className='qr-swatch'
          value={swatchColor}
          onChange={onSwatchChange}
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
          />
        </div>
      </div>
    </div>
  )
}

export default ColorField
