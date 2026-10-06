import { ChangeEvent, useEffect, useState } from 'react'
import { RangeFieldProps } from '../types/ui'
import { fieldBase, fieldLabel, fieldValid } from '../styles/field'

function RangeField ({ id, label, value, min, max, step, unit, onChange, hint }: RangeFieldProps) {
  const [draft, setDraft] = useState<string>(String(value))
  const hintId = `${id}-hint`

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  const onDraftChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
    setDraft(raw)

    const parsed = Number(raw)
    if (raw !== '' && Number.isFinite(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed)
    }
  }

  const onDraftBlur = () => {
    setDraft(String(value))
  }

  const onRangeChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value))
  }

  return (
    <div className='flex flex-col gap-1'>
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <div className='relative'>
        <input
          id={id}
          type='number'
          inputMode='numeric'
          min={min}
          max={max}
          step={step}
          className={`qr-number ${fieldBase} ${fieldValid} pr-8`}
          value={draft}
          onChange={onDraftChange}
          onBlur={onDraftBlur}
          aria-describedby={hint ? hintId : undefined}
        />
        <span aria-hidden='true' className='absolute right-0 bottom-2 font-mono text-sm text-muted'>
          {unit}
        </span>
      </div>
      <input
        type='range'
        aria-label={`${label} slider`}
        min={min}
        max={max}
        step={step}
        className='qr-range mt-2'
        value={value}
        onChange={onRangeChange}
      />
      {hint && (
        <p id={hintId} className='text-xs text-muted'>
          {hint}
        </p>
      )}
    </div>
  )
}

export default RangeField
