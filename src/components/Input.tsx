import { InputProps } from '../types/ui'
import { focusRing } from '../styles/focusRing'

function Input({ id, label, value, onChange, placeholder, error }: InputProps) {
  const errorId = `${id}-error`

  return (
    <div className='flex flex-col space-y-1'>
      <label htmlFor={id} className='text-sm font-medium text-gray-700'>
        {label}
      </label>
      <input
        id={id}
        placeholder={placeholder}
        type='text'
        className={`py-3 px-4 bg-white rounded-lg border ${error ? 'border-red-500' : 'border-gray-200'} placeholder-gray-400 text-gray-900 appearance-none inline-block w-full shadow-sm ${focusRing}`}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className='text-sm text-red-600'>
          {error}
        </p>
      )}
    </div>
  )
}

export default Input
