import { FrameLayout } from '../types/design'

export const FRAME_FONT_FAMILY = '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif'
export const FRAME_FONT_WEIGHT = 600

// One geometry for the preview and every export, proportional to the code so it scales to print sizes
export function frameLayout (width: number, height: number): FrameLayout {
  const side = Math.max(width, height)
  const border = Math.round(side * 0.04)
  const band = Math.round(side * 0.16)

  return {
    border,
    band,
    fontSize: Math.round(band * 0.45),
    width: width + border * 2,
    height: height + border + band
  }
}
