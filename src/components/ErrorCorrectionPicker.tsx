import { ErrorCorrectionLevel } from 'qr-code-styling'
import { ErrorCorrectionPickerProps, OptionPickerItem } from '../types/ui'
import OptionPicker from './OptionPicker'

const LEVEL_OPTIONS: readonly OptionPickerItem<ErrorCorrectionLevel>[] = (['L', 'M', 'Q', 'H'] as const)
  .map((level) => ({ value: level, label: level }))

function ErrorCorrectionPicker ({ id, label, level, onLevelChange, hint }: ErrorCorrectionPickerProps) {
  return (
    <OptionPicker id={id} label={label} value={level} options={LEVEL_OPTIONS} onChange={onLevelChange} hint={hint} />
  )
}

export default ErrorCorrectionPicker
