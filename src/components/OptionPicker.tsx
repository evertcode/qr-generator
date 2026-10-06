import { OptionPickerProps } from '../types/ui'
import { fieldLabel } from '../styles/field'

const SEGMENT = 'block px-3 py-1.5 font-mono text-sm'
const TILE = 'flex h-full flex-col items-center gap-1 px-2 py-2 text-xs text-center'

function OptionPicker<T extends string> ({ id, label, value, options, onChange, hint, labelHidden = false }: OptionPickerProps<T>) {
  const hintId = `${id}-hint`
  const hasIcons = options.some((option) => option.icon)

  return (
    <fieldset aria-describedby={hint ? hintId : undefined}>
      <legend className={labelHidden ? 'sr-only' : fieldLabel}>{label}</legend>
      <div className={hasIcons ? 'mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6' : 'mt-2 inline-flex border border-ink'}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`${hasIcons ? 'border border-ink' : 'border-l border-ink first:border-l-0'} ${option.disabled ? 'cursor-not-allowed text-muted' : 'cursor-pointer'}`}
          >
            <input
              id={`${id}-${option.value}`}
              type='radio'
              name={id}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
              className='peer sr-only'
            />
            <span className={`${hasIcons ? TILE : SEGMENT} peer-enabled:hover:bg-rule peer-disabled:line-through peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-moss`}>
              {option.icon}
              {option.label}
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

export default OptionPicker
