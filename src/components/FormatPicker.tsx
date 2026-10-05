import { FileExtension } from 'qr-code-styling'
import { FormatPickerProps } from '../types/ui'
import { fieldLabel } from '../styles/field'

const FILE_EXTENSIONS: readonly FileExtension[] = ['svg', 'png', 'jpeg', 'webp']

function FormatPicker ({ id, label, fileExtension, onExtensionChange }: FormatPickerProps) {
  return (
    <fieldset>
      <legend className={fieldLabel}>{label}</legend>
      <div className='mt-2 inline-flex border border-ink'>
        {FILE_EXTENSIONS.map((extension) => (
          <label key={extension} className='border-l border-ink first:border-l-0 cursor-pointer'>
            <input
              id={`${id}-${extension}`}
              type='radio'
              name={id}
              value={extension}
              checked={fileExtension === extension}
              onChange={() => onExtensionChange(extension)}
              className='peer sr-only'
            />
            <span className='block px-3 py-1.5 font-mono text-sm hover:bg-rule peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-moss'>
              {extension}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default FormatPicker
