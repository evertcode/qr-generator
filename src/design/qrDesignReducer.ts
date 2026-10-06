import { QrDesign, QrDesignAction } from '../types/design'
import { DEFAULT_LOGO_SETTINGS, DEFAULT_QR_DESIGN } from './defaultDesign'

export function qrDesignReducer (state: QrDesign, action: QrDesignAction): QrDesign {
  switch (action.type) {
    case 'set-content':
      return { ...state, content: action.content }
    case 'set-size':
      return { ...state, size: { ...state.size, [action.dimension]: action.value } }
    case 'set-error-correction':
      return { ...state, errorCorrectionLevel: action.level }
    case 'set-fill':
      return { ...state, [action.target]: { ...state[action.target], fill: action.fill } }
    case 'set-shape':
      return { ...state, [action.target]: { ...state[action.target], type: action.shape } }
    case 'set-background':
      return { ...state, background: { ...state.background, transparent: action.transparent } }
    case 'set-margin':
      return { ...state, margin: action.margin }
    case 'set-logo':
      // A new image keeps the size and margin chosen for the previous one
      return {
        ...state,
        logo: { ...(state.logo ?? DEFAULT_LOGO_SETTINGS), src: action.src, name: action.name }
      }
    case 'update-logo':
      // Settings only apply to an existing logo; there is nothing to tune without one
      return state.logo ? { ...state, logo: { ...state.logo, ...action.settings } } : state
    case 'remove-logo':
      return { ...state, logo: null }
    case 'apply-preset':
      // Presets only restyle the code: content, size, logo and error correction stay as they are
      return { ...state, ...action.style }
    case 'replace':
      return action.design
    case 'reset':
      return DEFAULT_QR_DESIGN
  }
}
