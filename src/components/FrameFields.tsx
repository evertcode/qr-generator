import { FrameFieldsProps } from '../types/ui'
import { DEFAULT_FRAME } from '../design/defaultDesign'
import { FRAME_TEXT_MAX_LENGTH } from '../design/limits'
import CheckboxField from './CheckboxField'
import ColorField from './ColorField'
import Input from './Input'

function FrameFields ({ frame, onChange }: FrameFieldsProps) {
  return (
    <>
      <CheckboxField
        id='qr-frame-enabled'
        label='Add a frame'
        checked={frame !== null}
        onChange={(enabled) => onChange(enabled ? DEFAULT_FRAME : null)}
      />
      {frame && (
        <>
          <Input
            id='qr-frame-text'
            label='Frame text'
            placeholder={DEFAULT_FRAME.text}
            maxLength={FRAME_TEXT_MAX_LENGTH}
            value={frame.text}
            onChange={(event) => onChange({ ...frame, text: event.target.value })}
          />
          <ColorField
            id='qr-frame-color'
            label='Frame color'
            color={frame.color}
            onChange={(color) => onChange({ ...frame, color })}
          />
          <ColorField
            id='qr-frame-text-color'
            label='Text color'
            color={frame.textColor}
            onChange={(textColor) => onChange({ ...frame, textColor })}
          />
        </>
      )}
    </>
  )
}

export default FrameFields
