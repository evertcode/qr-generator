import { InitialDesign } from '../types/design'
import { DEFAULT_QR_DESIGN } from './defaultDesign'
import { loadSavedDesign } from './persistence'
import { decodeDesignFromHash, hasSharedDesign } from './shareLink'

// A shared link wins over the saved design; a broken link falls back to the default, not to storage
export function resolveInitialDesign (storage: Storage | null, hash: string): InitialDesign {
  if (hasSharedDesign(hash)) {
    const shared = decodeDesignFromHash(hash)
    return shared
      ? { design: shared, source: 'link' }
      : { design: DEFAULT_QR_DESIGN, source: 'invalid-link' }
  }

  const saved = storage && loadSavedDesign(storage)
  return saved ? { design: saved, source: 'storage' } : { design: DEFAULT_QR_DESIGN, source: 'default' }
}
