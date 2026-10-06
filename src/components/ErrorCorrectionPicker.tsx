import { ErrorCorrectionLevel } from 'qr-code-styling'
import { ErrorCorrectionPickerProps } from '../types/ui'
import { fieldLabel } from '../styles/field'

const ERROR_CORRECTION_LEVELS: readonly ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H']

function ErrorCorrectionPicker ({ id, label, level, onLevelChange, hint }: ErrorCorrectionPickerProps) {
  const hintId = `${id}-hint`

  return (
    <fieldset aria-describedby={hint ? hintId : undefined}>
      <legend className={fieldLabel}>{label}</legend>
      <div className='mt-2 inline-flex border border-ink'>
        {ERROR_CORRECTION_LEVELS.map((value) => (
          <label key={value} className='border-l border-ink first:border-l-0 cursor-pointer'>
            <input
              id={`${id}-${value}`}
              type='radio'
              name={id}
              value={value}
              checked={level === value}
              onChange={() => onLevelChange(value)}
              className='peer sr-only'
            />
            <span className='block px-3 py-1.5 font-mono text-sm hover:bg-rule peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-moss'>
              {value}
            </span>
          </label>
        ))}
      </div>
      {hint && (
        <p id={hintId} className='mt-2 text-sm text-muted'>
          {hint}
        </p>
      )}
    </fieldset>
  )
}

export default ErrorCorrectionPicker
