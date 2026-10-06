import { describe, expect, it } from 'vitest'
import { resolveInitialDesign } from '../../src/design/initialDesign'
import { DEFAULT_QR_DESIGN } from '../../src/design/defaultDesign'
import { saveDesign } from '../../src/design/persistence'
import { encodeDesignToHash } from '../../src/design/shareLink'
import { QrDesign } from '../../src/types/design'

const savedDesign: QrDesign = { ...DEFAULT_QR_DESIGN, content: { type: 'text', text: 'saved' } }
const linkedDesign: QrDesign = { ...DEFAULT_QR_DESIGN, content: { type: 'text', text: 'linked' } }

const storageWith = (design: QrDesign) => {
  saveDesign(localStorage, design)
  return localStorage
}

describe('resolveInitialDesign', () => {
  it('prefers a shared link over the saved design', () => {
    const initial = resolveInitialDesign(storageWith(savedDesign), `#${encodeDesignToHash(linkedDesign)}`)

    expect(initial).toEqual({ design: linkedDesign, source: 'link' })
  })

  it('falls back to the default, not the saved design, for a broken link', () => {
    const initial = resolveInitialDesign(storageWith(savedDesign), '#design=broken')

    expect(initial).toEqual({ design: DEFAULT_QR_DESIGN, source: 'invalid-link' })
  })

  it('restores the saved design without a link', () => {
    expect(resolveInitialDesign(storageWith(savedDesign), '')).toEqual({ design: savedDesign, source: 'storage' })
  })

  it('uses the default design when there is nothing to load', () => {
    expect(resolveInitialDesign(null, '')).toEqual({ design: DEFAULT_QR_DESIGN, source: 'default' })
  })
})
