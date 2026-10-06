import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  // The app autosaves, so each test starts from an empty storage
  localStorage.clear()
})
