import { QrFill, QrStylePreset } from '../types/design'

const solid = (color: string): QrFill => ({ kind: 'solid', color })

// Every preset keeps dark ink on a light background with at least 4:1 contrast (see tests/design/presets.test.ts)
export const QR_STYLE_PRESETS: readonly QrStylePreset[] = [
  {
    id: 'classic',
    name: 'Classic',
    style: {
      dots: { type: 'square', fill: solid('#000000') },
      cornersSquare: { type: 'square', fill: solid('#000000') },
      cornersDot: { type: 'square', fill: solid('#000000') },
      background: { transparent: false, fill: solid('#ffffff') },
      margin: 16
    }
  },
  {
    id: 'soft',
    name: 'Soft',
    style: {
      dots: { type: 'rounded', fill: solid('#3f3f46') },
      cornersSquare: { type: 'extra-rounded', fill: solid('#3f3f46') },
      cornersDot: { type: 'dot', fill: solid('#3f3f46') },
      background: { transparent: false, fill: solid('#fafaf9') },
      margin: 16
    }
  },
  {
    id: 'dotted',
    name: 'Dotted',
    style: {
      dots: { type: 'dots', fill: solid('#1e293b') },
      cornersSquare: { type: 'dot', fill: solid('#1e293b') },
      cornersDot: { type: 'dot', fill: solid('#1e293b') },
      background: { transparent: false, fill: solid('#ffffff') },
      margin: 16
    }
  },
  {
    id: 'ocean',
    name: 'Ocean',
    style: {
      dots: { type: 'classy-rounded', fill: { kind: 'gradient', gradientType: 'linear', rotation: 45, colors: ['#0c4a6e', '#0369a1'] } },
      cornersSquare: { type: 'extra-rounded', fill: solid('#0c4a6e') },
      cornersDot: { type: 'dot', fill: solid('#0c4a6e') },
      background: { transparent: false, fill: solid('#f0f9ff') },
      margin: 16
    }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    style: {
      dots: { type: 'classy', fill: { kind: 'gradient', gradientType: 'radial', rotation: 0, colors: ['#7c2d12', '#be123c'] } },
      cornersSquare: { type: 'square', fill: solid('#7c2d12') },
      cornersDot: { type: 'square', fill: solid('#7c2d12') },
      background: { transparent: false, fill: solid('#fff7ed') },
      margin: 16
    }
  }
]
