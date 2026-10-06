import { OptionPickerItem, ShapeIconProps, ShapePickersProps } from '../types/ui'
import { QrShapeTarget, QrShapeTypes } from '../types/design'
import OptionPicker from './OptionPicker'
import ShapeIcon from './ShapeIcon'

type ShapeOption<K extends QrShapeTarget> = Omit<OptionPickerItem<QrShapeTypes[K]>, 'icon'>

const withIcons = <K extends QrShapeTarget>(target: K, options: readonly ShapeOption<K>[]): OptionPickerItem<QrShapeTypes[K]>[] =>
  // The cast pairs each target with its own shape union, which TypeScript cannot correlate on its own
  options.map((option) => ({ ...option, icon: <ShapeIcon {...({ target, shape: option.value } as ShapeIconProps)} /> }))

const DOT_OPTIONS = withIcons('dots', [
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy rounded' },
  { value: 'square', label: 'Square' },
  { value: 'extra-rounded', label: 'Extra rounded' }
])

const CORNER_SQUARE_OPTIONS = withIcons('cornersSquare', [
  { value: 'extra-rounded', label: 'Rounded' },
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Circle' }
])

const CORNER_DOT_OPTIONS = withIcons('cornersDot', [
  { value: 'dot', label: 'Dot' },
  { value: 'square', label: 'Square' }
])

function ShapePickers ({ shapes, onShapeChange }: ShapePickersProps) {
  return (
    <>
      <OptionPicker
        id='qr-dots-shape'
        label='Dots'
        value={shapes.dots}
        options={DOT_OPTIONS}
        onChange={(shape) => onShapeChange({ type: 'set-shape', target: 'dots', shape })}
      />
      <OptionPicker
        id='qr-corners-square-shape'
        label='Eye frame'
        value={shapes.cornersSquare}
        options={CORNER_SQUARE_OPTIONS}
        onChange={(shape) => onShapeChange({ type: 'set-shape', target: 'cornersSquare', shape })}
      />
      <OptionPicker
        id='qr-corners-dot-shape'
        label='Eye center'
        value={shapes.cornersDot}
        options={CORNER_DOT_OPTIONS}
        onChange={(shape) => onShapeChange({ type: 'set-shape', target: 'cornersDot', shape })}
      />
    </>
  )
}

export default ShapePickers
