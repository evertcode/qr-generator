import { QrFill, QrFillKind, QrGradientType } from '../types/design'
import { FillFieldProps, OptionPickerItem } from '../types/ui'
import { fieldLabel } from '../styles/field'
import ColorField from './ColorField'
import OptionPicker from './OptionPicker'
import RangeField from './RangeField'

const KIND_OPTIONS: readonly OptionPickerItem<QrFillKind>[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'gradient', label: 'Gradient' }
]

const GRADIENT_TYPE_OPTIONS: readonly OptionPickerItem<QrGradientType>[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' }
]

const DEFAULT_GRADIENT_END = '#3f6212'

function FillField ({ id, label, fill, onChange, hint, defaultGradientEnd = DEFAULT_GRADIENT_END }: FillFieldProps) {
  const hintId = `${id}-hint`

  const onKindChange = (kind: QrFillKind) => {
    if (kind === fill.kind) return
    // Switching keeps the first color so the code does not jump to an unrelated look
    const next: QrFill = fill.kind === 'solid'
      ? { kind: 'gradient', gradientType: 'linear', rotation: 0, colors: [fill.color, defaultGradientEnd] }
      : { kind: 'solid', color: fill.colors[0] }
    onChange(next)
  }

  return (
    <div className='space-y-3'>
      {fill.kind === 'solid'
        ? <ColorField id={id} label={label} hint={hint} color={fill.color} onChange={(color) => onChange({ kind: 'solid', color })} />
        : (
          <fieldset className='space-y-3' aria-describedby={hint ? hintId : undefined}>
            <legend className={fieldLabel}>{label}{' '}<span className='sr-only'>gradient</span></legend>
            {hint && <p id={hintId} className='text-xs text-muted'>{hint}</p>}
            <ColorField
              id={`${id}-start`}
              label='Start color'
              color={fill.colors[0]}
              onChange={(color) => onChange({ ...fill, colors: [color, fill.colors[1]] })}
            />
            <ColorField
              id={`${id}-end`}
              label='End color'
              color={fill.colors[1]}
              onChange={(color) => onChange({ ...fill, colors: [fill.colors[0], color] })}
            />
            <OptionPicker
              id={`${id}-gradient-type`}
              label='Gradient type'
              value={fill.gradientType}
              options={GRADIENT_TYPE_OPTIONS}
              onChange={(gradientType) => onChange({ ...fill, gradientType })}
            />
            {fill.gradientType === 'linear' && (
              <RangeField
                id={`${id}-angle`}
                label='Angle'
                value={fill.rotation}
                min={0}
                max={360}
                step={15}
                unit='°'
                onChange={(rotation) => onChange({ ...fill, rotation })}
              />
            )}
          </fieldset>
          )}
      <OptionPicker
        id={`${id}-kind`}
        label={`${label} fill`}
        labelHidden
        value={fill.kind}
        options={KIND_OPTIONS}
        onChange={onKindChange}
      />
    </div>
  )
}

export default FillField
