import { useRef } from 'react'
import { InputFileProps } from '../types/ui'
import { focusRing } from '../styles/focusRing'
import { LOGO_ACCEPTED_TYPES } from '../utils/validateLogoFile'

const textAction = `rounded-sm text-sm font-medium underline underline-offset-4 decoration-1 hover:decoration-2 ${focusRing}`

function InputFile ({ id, label, image, imageName, onChangeImage, onRemoveImage, error }: InputFileProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const errorId = `${id}-error`
  const describedBy = error ? errorId : undefined

  const onOpenFileDialog = () => {
    inputRef.current?.click()
  }

  return (
    <div>
      {image
        ? (
          <div className='flex items-center gap-3 py-2 border-b border-rule'>
            <img src={image} alt='' className='w-10 h-10 p-1 object-contain bg-white border border-rule' />
            <span className='flex-1 min-w-0 truncate font-mono text-sm' title={imageName}>
              {imageName}
            </span>
            <button type='button' onClick={onOpenFileDialog} aria-describedby={describedBy} className={`${textAction} text-moss`}>
              change
            </button>
            <span aria-hidden='true' className='text-muted'>·</span>
            <button type='button' onClick={onRemoveImage} className={`${textAction} text-red-700`}>
              remove
            </button>
          </div>
          )
        : (
          <button type='button' onClick={onOpenFileDialog} aria-describedby={describedBy} className={`${textAction} inline-flex items-center gap-2 text-moss`}>
            <span aria-hidden='true' className='font-mono no-underline'>+</span>
            {label}
          </button>
          )}
      <input
        id={id}
        ref={inputRef}
        type='file'
        accept={LOGO_ACCEPTED_TYPES.join(',')}
        onChange={onChangeImage}
        className='hidden'
        tabIndex={-1}
        aria-hidden='true'
      />
      {error && (
        <p id={errorId} role='alert' className='mt-2 text-sm text-red-700'>
          {error}
        </p>
      )}
    </div>
  )
}

export default InputFile
