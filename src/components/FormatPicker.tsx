import { FileExtension } from 'qr-code-styling'
import { FormatPickerProps, OptionPickerItem } from '../types/ui'
import OptionPicker from './OptionPicker'

const FILE_EXTENSIONS: readonly FileExtension[] = ['svg', 'png', 'jpeg', 'webp']

function FormatPicker ({ id, label, fileExtension, onExtensionChange, disabledExtensions = [], hint }: FormatPickerProps) {
  const options: OptionPickerItem<FileExtension>[] = FILE_EXTENSIONS.map((extension) => ({
    value: extension,
    label: extension,
    disabled: disabledExtensions.includes(extension)
  }))

  return (
    <OptionPicker id={id} label={label} value={fileExtension} options={options} onChange={onExtensionChange} hint={hint} />
  )
}

export default FormatPicker
