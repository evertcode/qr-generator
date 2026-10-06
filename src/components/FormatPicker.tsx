import { FileExtension } from 'qr-code-styling'
import { FormatPickerProps, OptionPickerItem } from '../types/ui'
import OptionPicker from './OptionPicker'

const FORMAT_OPTIONS: readonly OptionPickerItem<FileExtension>[] = (['svg', 'png', 'jpeg', 'webp'] as const)
  .map((extension) => ({ value: extension, label: extension }))

function FormatPicker ({ id, label, fileExtension, onExtensionChange }: FormatPickerProps) {
  return (
    <OptionPicker id={id} label={label} value={fileExtension} options={FORMAT_OPTIONS} onChange={onExtensionChange} />
  )
}

export default FormatPicker
