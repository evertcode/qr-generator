const TEXT_INPUT_TYPES = ['text', 'number', 'email', 'tel', 'url', 'search', 'password']

// Fields where the browser's own undo should keep working instead of the design history
export function isTextEntry (target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable || target instanceof HTMLTextAreaElement) return true
  return target instanceof HTMLInputElement && TEXT_INPUT_TYPES.includes(target.type)
}
