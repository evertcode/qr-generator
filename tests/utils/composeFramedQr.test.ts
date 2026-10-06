import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { composeFramedQr } from '../../src/utils/composeFramedQr'
import { frameLayout } from '../../src/design/frameLayout'
import { QrFrame } from '../../src/types/design'

const frame: QrFrame = { text: 'Scan <me> & "go"', color: '#222222', textColor: '#ffffff' }

const qrSvg = new Blob(
  ['<?xml version="1.0" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#fff"/></svg>'],
  { type: 'image/svg+xml' }
)

describe('frameLayout', () => {
  it('grows the canvas by a border on three sides and a text band at the bottom', () => {
    expect(frameLayout(300, 300)).toEqual({ border: 12, band: 48, fontSize: 22, width: 324, height: 360 })
  })

  it('scales with the code size', () => {
    const layout = frameLayout(4096, 4096)

    expect(layout.border / 4096).toBeCloseTo(12 / 300, 2)
    expect(layout.band / 4096).toBeCloseTo(48 / 300, 2)
  })
})

describe('composeFramedQr as SVG', () => {
  it('wraps the QR in a framed SVG with the escaped frame text', async () => {
    const framed = await composeFramedQr(qrSvg, frame, 'svg')
    const document = new DOMParser().parseFromString(await framed.text(), 'image/svg+xml')
    const root = document.documentElement

    expect(framed.type).toBe('image/svg+xml')
    expect(root.getAttribute('width')).toBe('324')
    expect(root.getAttribute('height')).toBe('360')
    expect(root.querySelector('svg')?.getAttribute('x')).toBe('12')
    expect(root.querySelector('text')?.textContent).toBe('Scan <me> & "go"')
    expect(await framed.text()).toContain('Scan &lt;me&gt; &amp; &quot;go&quot;')
  })
})

describe('composeFramedQr as raster', () => {
  const drawn: string[] = []

  beforeEach(() => {
    drawn.length = 0
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 300, height: 300 })))
    Object.defineProperty(document, 'fonts', { value: { load: vi.fn(async () => []) }, configurable: true })
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ({
      fillRect: () => drawn.push('frame'),
      drawImage: (_: unknown, x: number, y: number) => drawn.push(`qr at ${x},${y}`),
      fillText: (text: string) => drawn.push(`text ${text}`)
    }) as unknown as CanvasRenderingContext2D)
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (this: HTMLCanvasElement, done, type) {
      done(new Blob([`${this.width}x${this.height}`], { type }))
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    Reflect.deleteProperty(document, 'fonts')
  })

  it.each([
    ['png', 'image/png'],
    ['jpeg', 'image/jpeg'],
    ['webp', 'image/webp']
  ] as const)('returns a framed %s blob', async (extension, type) => {
    const framed = await composeFramedQr(new Blob(['raw']), frame, extension)

    expect(framed.type).toBe(type)
    expect(await framed.text()).toBe('324x360')
    expect(drawn).toEqual(['frame', 'qr at 12,12', `text ${frame.text}`])
  })

  it('waits for the frame font before drawing text', async () => {
    await composeFramedQr(new Blob(['raw']), frame, 'png')

    expect(document.fonts.load).toHaveBeenCalledWith(expect.stringContaining('IBM Plex Sans'))
  })
})
