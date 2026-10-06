import { KeyboardEvent, useRef } from 'react'
import { QrContentType } from '../types/design'
import { ContentTypeTabsProps } from '../types/ui'
import { focusRing } from '../styles/focusRing'

const TABS: readonly { type: QrContentType; label: string }[] = [
  { type: 'text', label: 'Link or text' },
  { type: 'wifi', label: 'WiFi' },
  { type: 'email', label: 'Email' },
  { type: 'phone', label: 'Phone' },
  { type: 'sms', label: 'SMS' },
  { type: 'vcard', label: 'Contact' }
]

export const contentTabId = (id: string, type: QrContentType) => `${id}-tab-${type}`
export const contentPanelId = (id: string) => `${id}-panel`

function ContentTypeTabs ({ id, value, onChange }: ContentTypeTabsProps) {
  const tabRefs = useRef<Partial<Record<QrContentType, HTMLButtonElement | null>>>({})

  // Arrow keys, Home and End move and activate tabs (WAI-ARIA tabs pattern, automatic activation)
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = TABS.findIndex((tab) => tab.type === value)
    const next = {
      ArrowRight: (index + 1) % TABS.length,
      ArrowLeft: (index - 1 + TABS.length) % TABS.length,
      Home: 0,
      End: TABS.length - 1
    }[event.key]
    if (next === undefined) return

    event.preventDefault()
    const { type } = TABS[next]
    onChange(type)
    tabRefs.current[type]?.focus()
  }

  return (
    <div role='tablist' aria-label='Content type' className='flex flex-wrap gap-x-4 gap-y-2 border-b border-rule' onKeyDown={onKeyDown}>
      {TABS.map((tab) => {
        const selected = tab.type === value
        return (
          <button
            key={tab.type}
            ref={(element) => { tabRefs.current[tab.type] = element }}
            id={contentTabId(id, tab.type)}
            type='button'
            role='tab'
            aria-selected={selected}
            aria-controls={contentPanelId(id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.type)}
            className={`-mb-px pb-2 text-sm border-b-2 ${selected ? 'border-moss text-ink font-medium' : 'border-transparent text-muted hover:text-ink'} ${focusRing}`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default ContentTypeTabs
