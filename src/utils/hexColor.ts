const SHORT_HEX = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i
const LONG_HEX = /^#?([0-9a-f]{6})$/i

// Returns the color as `#rrggbb` (the format `<input type="color">` needs), or null when invalid
export function normalizeHexColor (value: string): string | null {
  const trimmed = value.trim()

  const short = SHORT_HEX.exec(trimmed)
  if (short) {
    const [, r, g, b] = short
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }

  const long = LONG_HEX.exec(trimmed)
  if (long) {
    return `#${long[1]}`.toLowerCase()
  }

  return null
}
