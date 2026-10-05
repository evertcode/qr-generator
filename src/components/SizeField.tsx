import { ChangeEvent, useEffect, useState } from 'react'
import { SizeFieldProps } from '../types/ui'

function SizeField({ id, label, value, min, max, onChange }: SizeFieldProps) {
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
    <div className='flex flex-col space-y-1'>
      <label htmlFor={id} className='text-sm font-medium text-gray-700'>
        {label}
      </label>
      <input
        id={id}
        type='number'
        inputMode='numeric'
        min={min}
        max={max}
        className='py-3 px-4 bg-white rounded-lg border border-gray-200 placeholder-gray-400 text-gray-900 w-full shadow-sm'
        value={draft}
        onChange={onDraftChange}
        onBlur={onDraftBlur}
      />
      <input
        type='range'
        aria-label={`${label} slider`}
        min={min}
        max={max}
        step={10}
        className='qr-range w-full cursor-pointer'
        value={value}
        onChange={onRangeChange}
      />
      <span className='text-xs text-gray-500'>{min}–{max} px</span>
    </div>
  )
}

export default SizeField
