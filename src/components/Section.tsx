import { SectionProps } from '../types/ui'

function Section ({ number, title, children }: SectionProps) {
  return (
    <section className='space-y-4'>
      <h2 className='flex items-baseline gap-3 text-sm'>
        {number && <span className='font-mono text-muted'>{number}</span>}
        <span className='font-medium'>{title}</span>
        <span aria-hidden='true' className='flex-1 border-t border-rule' />
      </h2>
      {children}
    </section>
  )
}

export default Section
