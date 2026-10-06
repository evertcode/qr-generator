import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useDebouncedValue } from '../../src/hooks/useDebouncedValue'

const DELAY_MS = 150

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('a', DELAY_MS))

    expect(result.current).toBe('a')
  })

  it('emits the new value after the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, DELAY_MS), {
      initialProps: { value: 'a' }
    })

    rerender({ value: 'b' })
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(DELAY_MS)
    })
    expect(result.current).toBe('b')
  })

  it('drops intermediate values when changes happen within the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, DELAY_MS), {
      initialProps: { value: 'a' }
    })
    const emitted: string[] = []

    rerender({ value: 'b' })
    act(() => {
      vi.advanceTimersByTime(DELAY_MS - 1)
    })
    emitted.push(result.current)

    rerender({ value: 'c' })
    act(() => {
      vi.advanceTimersByTime(DELAY_MS - 1)
    })
    emitted.push(result.current)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    emitted.push(result.current)

    expect(emitted).toEqual(['a', 'a', 'c'])
  })
})
