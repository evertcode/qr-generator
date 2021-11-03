interface Props {
  placeholder: string
  value: string | number | undefined,
  onChange: any
}

function Input({ value, onChange, placeholder }: Props) {
  return (
    <input
      placeholder={placeholder}
      type='text'
      className='py-3 px-4 bg-white rounded-lg placeholder-gray-400 text-gray-900 appearance-none inline-block w-full shadow-md'
      value={value}
      onChange={onChange}
    />
  )
}

export default Input
