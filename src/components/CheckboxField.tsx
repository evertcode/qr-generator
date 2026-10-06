import { CheckboxFieldProps } from '../types/ui'

function CheckboxField ({ id, label, checked, onChange }: CheckboxFieldProps) {
  return (
    <div className='flex items-center gap-3'>
      <input
        id={id}
        type='checkbox'
        className='h-4 w-4 accent-moss cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss'
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <label htmlFor={id} className='text-sm text-ink cursor-pointer'>
        {label}
      </label>
    </div>
  )
}

export default CheckboxField
