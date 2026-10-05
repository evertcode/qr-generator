import { InputProps } from '../types/ui'

function Input({ id, label, value, onChange, placeholder }: InputProps) {
  return (
    <div className='flex flex-col space-y-1'>
      <label htmlFor={id} className='text-sm font-medium text-gray-700'>
        {label}
      </label>
      <input
        id={id}
        placeholder={placeholder}
        type='text'
        className='py-3 px-4 bg-white rounded-lg border border-gray-200 placeholder-gray-400 text-gray-900 appearance-none inline-block w-full shadow-sm'
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default Input
