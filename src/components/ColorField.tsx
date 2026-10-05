import { useEffect, useRef, useState } from 'react'
import { ColorResult, SketchPicker } from 'react-color'
import { ColorFieldProps } from '../types/ui'
import { focusRing } from '../styles/focusRing'

function ColorField({ id, label, color, onChange }: ColorFieldProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  const onToggle = () => {
    setIsOpen((oldValue) => !oldValue)
  }

  const onClose = () => {
    setIsOpen(false)
  }

  const onPickerChange = (result: ColorResult) => {
    onChange(result.hex)
  }

  return (
    <div className='relative flex items-center justify-between'>
      <label htmlFor={id} className='text-sm font-medium text-gray-700'>
        {label}
      </label>
      <button
        id={id}
        ref={buttonRef}
        type='button'
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        onClick={onToggle}
        className={`flex items-center space-x-2 py-1 pl-1 pr-3 bg-white border border-gray-200 shadow-sm rounded-lg cursor-pointer hover:bg-gray-50 ${focusRing}`}
      >
        <span style={{ backgroundColor: color }} className='w-8 h-6 rounded-md border border-gray-200' />
        <span className='font-mono text-sm text-gray-700 uppercase'>{color}</span>
      </button>
      {isOpen && (
        <div role='dialog' aria-label={`${label} picker`} className='absolute top-full right-0 mt-2 z-10'>
          <div onClick={onClose} className='fixed top-0 right-0 bottom-0 left-0' />
          <div className='relative'>
            <SketchPicker color={color} onChange={onPickerChange} disableAlpha />
          </div>
        </div>
      )}
    </div>
  )
}

export default ColorField
