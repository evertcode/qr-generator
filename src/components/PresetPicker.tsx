import { CSSProperties } from 'react'
import { QrFill, QrStylePreset } from '../types/design'
import { PresetPickerProps } from '../types/ui'
import { focusRing } from '../styles/focusRing'
import ShapeIcon from './ShapeIcon'

const fillToCss = (fill: QrFill): string => {
  if (fill.kind === 'solid') return fill.color
  const [start, end] = fill.colors
  return fill.gradientType === 'linear'
    ? `linear-gradient(${fill.rotation}deg, ${start}, ${end})`
    : `radial-gradient(circle, ${start}, ${end})`
}

const firstColor = (fill: QrFill) => fill.kind === 'solid' ? fill.color : fill.colors[0]

function PresetSwatch ({ preset }: { preset: QrStylePreset }) {
  const { dots, cornersSquare, background } = preset.style
  const swatch: CSSProperties = { background: fillToCss(background.fill) }

  return (
    <span aria-hidden='true' className='flex items-center justify-center gap-1 h-10 w-full border border-rule' style={swatch}>
      <span style={{ color: firstColor(cornersSquare.fill) }}>
        <ShapeIcon target='cornersSquare' shape={cornersSquare.type} />
      </span>
      <span style={{ color: firstColor(dots.fill) }}>
        <ShapeIcon target='dots' shape={dots.type} />
      </span>
    </span>
  )
}

function PresetPicker ({ presets, onApply }: PresetPickerProps) {
  return (
    <ul className='grid grid-cols-2 gap-2 sm:grid-cols-5'>
      {presets.map((preset) => (
        <li key={preset.id}>
          <button
            type='button'
            onClick={() => onApply(preset)}
            className={`flex w-full flex-col items-center gap-2 p-2 border border-ink text-sm hover:bg-rule ${focusRing}`}
          >
            <PresetSwatch preset={preset} />
            {preset.name}
          </button>
        </li>
      ))}
    </ul>
  )
}

export default PresetPicker
