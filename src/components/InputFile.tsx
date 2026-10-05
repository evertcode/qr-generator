import { useRef } from 'react'
import { InputFileProps } from '../types/ui'
import { focusRing } from '../styles/focusRing'

function InputFile ({ id, label, image, imageName, onChangeImage, onRemoveImage }: InputFileProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const onOpenFileDialog = () => {
    inputRef.current?.click()
  }

  return (
    <div>
      {image
        ? (
          <div className='flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm'>
            <img src={image} alt='' className='w-12 h-12 object-contain rounded-md border border-gray-100' />
            <span className='flex-1 min-w-0 truncate text-sm text-gray-700' title={imageName}>
              {imageName}
            </span>
            <button
              type='button'
              onClick={onOpenFileDialog}
              className={`text-sm font-semibold text-green-700 rounded hover:text-green-800 ${focusRing}`}
            >
              Change
            </button>
            <button
              type='button'
              onClick={onRemoveImage}
              className={`text-sm font-semibold text-red-600 rounded hover:text-red-700 ${focusRing}`}
            >
              Remove logo
            </button>
          </div>
          )
        : (
          <button
            type='button'
            onClick={onOpenFileDialog}
            className={`w-full flex flex-col items-center px-4 py-6 bg-white text-green-700 rounded-lg shadow-sm tracking-wide uppercase border border-green-600 cursor-pointer hover:bg-green-700 hover:text-white ${focusRing}`}
          >
            <svg
              className='w-8 h-8'
              fill='currentColor'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              aria-hidden='true'
            >
              <path d='M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z' />
            </svg>
            <span className='mt-2 text-base leading-normal'>{label}</span>
          </button>
          )}
      <input
        id={id}
        ref={inputRef}
        type='file'
        accept='image/*'
        onChange={onChangeImage}
        className='hidden'
        tabIndex={-1}
        aria-hidden='true'
      />
    </div>
  )
}

export default InputFile
