import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Options } from 'qr-code-styling'
import { exportQr, sanitizeFileName, scaleQrOptions } from '../../src/utils/exportQr'

const qrDouble = vi.hoisted(() => ({ created: [] as Options[], download: vi.fn() }))

vi.mock('qr-code-styling', () => ({
  default: class {
    constructor (options: Options) {
      qrDouble.created.push(options)
    }

    download = qrDouble.download
  }
}))

const previewOptions: Options = {
  width: 300,
  height: 300,
  data: 'hello',
  margin: 16,
  imageOptions: { imageSize: 0.4, margin: 4, hideBackgroundDots: true }
}

describe('sanitizeFileName', () => {
  it.each([
    ['my code', 'my code'],
    ['  spaced  ', 'spaced'],
    ['../../etc/passwd', '....etcpasswd'],
    ['a<b>c:d"e|f?g*h', 'abcdefgh'],
    ['logo.png', 'logo'],
    ['menu.JPEG', 'menu'],
    ['trailing.', 'trailing'],
    ['', 'qr'],
    ['///', 'qr']
  ])('turns "%s" into "%s"', (input, expected) => {
    expect(sanitizeFileName(input)).toBe(expected)
  })

  it('caps the length', () => {
    expect(sanitizeFileName('x'.repeat(300))).toHaveLength(100)
  })
})

describe('scaleQrOptions', () => {
  it('keeps the preview options as they are', () => {
    expect(scaleQrOptions(previewOptions, 'preview')).toBe(previewOptions)
  })

  it('scales the size and both margins together', () => {
    // 300 to 1024 is a 3.41x scale: margins 16 and 4 become 55 and 14
    const scaled = scaleQrOptions(previewOptions, 1024)

    expect(scaled).toMatchObject({ width: 1024, height: 1024, margin: 55, imageOptions: { margin: 14, imageSize: 0.4 } })
  })

  it('fits the longest side and keeps the aspect ratio', () => {
    const scaled = scaleQrOptions({ ...previewOptions, width: 400, height: 200 }, 2048)

    expect(scaled).toMatchObject({ width: 2048, height: 1024 })
  })
})

describe('exportQr', () => {
  beforeEach(() => {
    qrDouble.created.length = 0
    qrDouble.download.mockClear()
  })

  it('exports at the chosen size from a separate instance', async () => {
    await exportQr(previewOptions, { extension: 'png', fileName: 'menu', size: 4096, frame: null })

    expect(qrDouble.created).toHaveLength(1)
    expect(qrDouble.created[0]).toMatchObject({ width: 4096, height: 4096 })
    expect(previewOptions.width).toBe(300)
  })

  it('downloads with the sanitized file name', async () => {
    await exportQr(previewOptions, { extension: 'svg', fileName: ' menu.svg ', size: 'preview', frame: null })

    expect(qrDouble.download).toHaveBeenCalledWith({ name: 'menu', extension: 'svg' })
  })
})
