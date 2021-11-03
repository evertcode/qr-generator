interface Props {
  fileExtension: any,
  onExtensionChange: any
}

function SelectExtension({ fileExtension, onExtensionChange }: Props) {
  return (
    <>
      <select
        placeholder='Extension'
        className='w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline'
        onChange={onExtensionChange}
        value={fileExtension}
      >
        <option value='svg'>SVG</option>
        <option value='png'>PNG</option>
        <option value='jpeg'>JPEG</option>
        <option value='webp'>WEBP</option>
      </select>
      <div className='absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none'>
        <svg className='w-4 h-4 fill-current' viewBox='0 0 20 20'>
          <path
            d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
            clipRule='evenodd'
            fillRule='evenodd'
          />
        </svg>
      </div>
    </>
  )
}

export default SelectExtension
