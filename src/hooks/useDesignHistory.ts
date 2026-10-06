import { useCallback, useReducer } from 'react'
import { DesignHistory, QrDesign, QrDesignAction } from '../types/design'
import { qrDesignReducer } from '../design/qrDesignReducer'

export const HISTORY_LIMIT = 100
export const COALESCE_WINDOW_MS = 500

interface HistoryState {
  past: QrDesign[]
  present: QrDesign
  future: QrDesign[]
  lastKey: string | null
  lastAt: number
}

type HistoryStep =
  | { type: 'apply'; action: QrDesignAction; at: number }
  | { type: 'undo' }
  | { type: 'redo' }

// Edits to the same field in a quick burst (typing, dragging a slider) become one undo step.
// Discrete actions return null and always get their own step.
const coalesceKey = (action: QrDesignAction): string | null => {
  switch (action.type) {
    case 'set-content':
      return `content:${action.content.type}`
    case 'set-size':
      return `size:${action.dimension}`
    case 'set-fill':
      return `fill:${action.target}`
    case 'set-margin':
      return 'margin'
    case 'set-frame':
      return 'frame'
    case 'update-logo':
      return `logo:${Object.keys(action.settings).sort().join(',')}`
    default:
      return null
  }
}

const historyReducer = (state: HistoryState, step: HistoryStep): HistoryState => {
  switch (step.type) {
    case 'apply': {
      const next = qrDesignReducer(state.present, step.action)
      if (next === state.present) return state

      const key = coalesceKey(step.action)
      const coalesce = key !== null && key === state.lastKey && step.at - state.lastAt <= COALESCE_WINDOW_MS
      return {
        past: coalesce ? state.past : [...state.past, state.present].slice(-HISTORY_LIMIT),
        present: next,
        future: [],
        lastKey: key,
        lastAt: step.at
      }
    }
    case 'undo': {
      const previous = state.past.at(-1)
      if (!previous) return state
      return { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future], lastKey: null, lastAt: 0 }
    }
    case 'redo': {
      const [next, ...future] = state.future
      if (!next) return state
      return { past: [...state.past, state.present], present: next, future, lastKey: null, lastAt: 0 }
    }
  }
}

const initHistory = (initial: QrDesign): HistoryState => ({ past: [], present: initial, future: [], lastKey: null, lastAt: 0 })

export function useDesignHistory (initial: QrDesign): DesignHistory {
  const [state, send] = useReducer(historyReducer, initial, initHistory)

  const dispatch = useCallback((action: QrDesignAction) => send({ type: 'apply', action, at: Date.now() }), [])
  const undo = useCallback(() => send({ type: 'undo' }), [])
  const redo = useCallback(() => send({ type: 'redo' }), [])

  return {
    design: state.present,
    dispatch,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0
  }
}
