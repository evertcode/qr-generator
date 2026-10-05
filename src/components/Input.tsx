import { InputProps } from '../types/ui'
import { fieldBase, fieldInvalid, fieldLabel, fieldValid } from '../styles/field'

function Input ({ id, label, value, onChange, placeholder, error }: InputProps) {
  const errorId = `${id}-error`

  return (
    <div className='flex flex-col gap-1'>
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <input
        id={id}
        placeholder={placeholder}
        type='text'
        className={`${fieldBase} ${error ? fieldInvalid : fieldValid}`}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className='text-sm text-red-700'>
          {error}
        </p>
      )}
    </div>
  )
}

export default Input
