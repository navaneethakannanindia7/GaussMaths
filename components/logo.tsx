import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({ href = '/', light = false, tag }: { href?: string; light?: boolean; tag?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5" aria-label="Gauss Maths home">
      <span className="grid size-9 place-items-center rounded-lg bg-lime text-lg font-black text-brand" aria-hidden="true">
        {'Σ'}
      </span>
      <span className={cn('text-lg font-extrabold tracking-tight', light ? 'text-white' : 'text-brand')}>Gauss Maths</span>
      {tag ? (
        <span
          className={cn(
            'rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider',
            light ? 'bg-white/15 text-lime' : 'bg-brand/10 text-brand',
          )}
        >
          {tag}
        </span>
      ) : null}
    </Link>
  )
}
