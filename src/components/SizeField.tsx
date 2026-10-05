import { ChangeEvent, useEffect, useState } from 'react'
import { SizeFieldProps } from '../types/ui'
import { fieldBase, fieldLabel, fieldValid } from '../styles/field'

function SizeField ({ id, label, value, min, max, onChange }: SizeFieldProps) {
  const [draft, setDraft] = useState<string>(String(value))

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
          className={`qr-number ${fieldBase} ${fieldValid} pr-8`}
          value={draft}
          onChange={onDraftChange}
          onBlur={onDraftBlur}
        />
        <span aria-hidden='true' className='absolute right-0 bottom-2 font-mono text-sm text-muted'>
          px
        </span>
      </div>
      <input
        type='range'
        aria-label={`${label} slider`}
        min={min}
        max={max}
        step={10}
        className='qr-range mt-2'
        value={value}
        onChange={onRangeChange}
      />
    </div>
  )
}

export default SizeField
