import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { COALESCE_WINDOW_MS, HISTORY_LIMIT, useDesignHistory } from '../../src/hooks/useDesignHistory'
import { DEFAULT_QR_DESIGN } from '../../src/design/defaultDesign'
import { QrDesignAction } from '../../src/types/design'

const text = (value: string): QrDesignAction => ({ type: 'set-content', content: { type: 'text', text: value } })
const margin = (value: number): QrDesignAction => ({ type: 'set-margin', margin: value })

const setup = () => renderHook(() => useDesignHistory(DEFAULT_QR_DESIGN))

describe('useDesignHistory', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Each step happens after the coalescing window, so it counts on its own
  const step = (run: () => void) => {
    act(() => {
      vi.advanceTimersByTime(COALESCE_WINDOW_MS + 1)
      run()
    })
  }

  it('starts with nothing to undo or redo', () => {
    const { result } = setup()

    expect(result.current.design).toBe(DEFAULT_QR_DESIGN)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('walks back and forth through the history', () => {
    const { result } = setup()
    step(() => result.current.dispatch(margin(10)))
    step(() => result.current.dispatch(margin(20)))

    step(() => result.current.undo())
    expect(result.current.design.margin).toBe(10)
    step(() => result.current.undo())
    expect(result.current.design.margin).toBe(0)
    expect(result.current.canUndo).toBe(false)

    step(() => result.current.redo())
    step(() => result.current.redo())
    expect(result.current.design.margin).toBe(20)
    expect(result.current.canRedo).toBe(false)
  })

  it('drops the redo stack on a new change after undo', () => {
    const { result } = setup()
    step(() => result.current.dispatch(margin(10)))
    step(() => result.current.undo())
    expect(result.current.canRedo).toBe(true)

    step(() => result.current.dispatch(margin(30)))

    expect(result.current.canRedo).toBe(false)
    expect(result.current.design.margin).toBe(30)
  })

  it('counts quick edits of the same field as one step', () => {
    const { result } = setup()
    act(() => {
      result.current.dispatch(text('h'))
      vi.advanceTimersByTime(COALESCE_WINDOW_MS - 100)
      result.current.dispatch(text('he'))
      vi.advanceTimersByTime(COALESCE_WINDOW_MS - 100)
      result.current.dispatch(text('hey'))
    })

    step(() => result.current.undo())

    expect(result.current.design).toBe(DEFAULT_QR_DESIGN)
  })

  it('splits edits of the same field after a pause', () => {
    const { result } = setup()
    step(() => result.current.dispatch(text('first')))
    step(() => result.current.dispatch(text('second')))

    step(() => result.current.undo())

    expect(result.current.design.content).toEqual({ type: 'text', text: 'first' })
  })

  it('never merges edits of different fields', () => {
    const { result } = setup()
    act(() => {
      result.current.dispatch(text('quick'))
      result.current.dispatch(margin(12))
    })

    step(() => result.current.undo())

    expect(result.current.design.content).toEqual({ type: 'text', text: 'quick' })
    expect(result.current.design.margin).toBe(0)
  })

  it('never merges discrete actions such as shape changes', () => {
    const { result } = setup()
    act(() => {
      result.current.dispatch({ type: 'set-shape', target: 'dots', shape: 'square' })
      result.current.dispatch({ type: 'set-shape', target: 'dots', shape: 'dots' })
    })

    step(() => result.current.undo())

    expect(result.current.design.dots.type).toBe('square')
  })

  it('ignores actions that change nothing', () => {
    const { result } = setup()

    step(() => result.current.dispatch({ type: 'reset' }))

    expect(result.current.canUndo).toBe(false)
  })

  it(`keeps at most ${HISTORY_LIMIT} steps`, () => {
    const { result } = setup()
    for (let value = 1; value <= HISTORY_LIMIT + 5; value++) {
      step(() => result.current.dispatch(margin(value % 50)))
    }

    let undos = 0
    while (result.current.canUndo) {
      step(() => result.current.undo())
      undos++
    }

    expect(undos).toBe(HISTORY_LIMIT)
  })
})
