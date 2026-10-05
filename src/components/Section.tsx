import { SectionProps } from '../types/ui'

function Section({ title, children }: SectionProps) {
  return (
    <section className='space-y-3'>
      <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>
        {title}
      </h2>
      {children}
    </section>
  )
}

export default Section
