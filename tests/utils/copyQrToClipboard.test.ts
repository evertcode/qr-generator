import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import QRCodeStyling from 'qr-code-styling'
import { copyQrToClipboard } from '../../src/utils/copyQrToClipboard'

class FakeClipboardItem {
  constructor (readonly items: Record<string, Promise<Blob>>) {}
}

const pngBlob = new Blob(['png'], { type: 'image/png' })
const qrCodeReturning = (blob: Blob | null) =>
  ({ getRawData: vi.fn().mockResolvedValue(blob) }) as unknown as QRCodeStyling

const stubClipboardWrite = (write: (items: FakeClipboardItem[]) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', { value: { write }, configurable: true })
}

describe('copyQrToClipboard', () => {
  beforeEach(() => {
    vi.stubGlobal('ClipboardItem', FakeClipboardItem)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(navigator, 'clipboard')
  })

  it('returns copied and writes a PNG ClipboardItem', async () => {
    const write = vi.fn().mockResolvedValue(undefined)
    stubClipboardWrite(write)

    const result = await copyQrToClipboard(qrCodeReturning(pngBlob))

    expect(result).toBe('copied')
    const [[item]] = write.mock.calls[0]
    expect(item).toBeInstanceOf(FakeClipboardItem)
    await expect(item.items['image/png']).resolves.toBe(pngBlob)
  })

  it('returns unsupported when ClipboardItem is missing', async () => {
    vi.stubGlobal('ClipboardItem', undefined)
    stubClipboardWrite(vi.fn())

    expect(await copyQrToClipboard(qrCodeReturning(pngBlob))).toBe('unsupported')
  })

  it('returns unsupported when navigator.clipboard.write is missing', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })

    expect(await copyQrToClipboard(qrCodeReturning(pngBlob))).toBe('unsupported')
  })

  it('returns failed when the clipboard write rejects', async () => {
    stubClipboardWrite(vi.fn().mockRejectedValue(new DOMException('Denied', 'NotAllowedError')))

    expect(await copyQrToClipboard(qrCodeReturning(pngBlob))).toBe('failed')
  })

  it('returns failed when the QR code cannot be rendered as PNG', async () => {
    stubClipboardWrite(async ([item]) => {
      await item.items['image/png']
    })

    expect(await copyQrToClipboard(qrCodeReturning(null))).toBe('failed')
  })
})
