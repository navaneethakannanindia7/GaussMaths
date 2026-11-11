import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type LogoProps = {
  href?: string
  light?: boolean
  tag?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function Logo({
  href = '/',
  light = false,
  tag,
  size = 'md',
  showText = true,
  className,
}: LogoProps) {
  const dim = {
    sm: 32,
    md: 40,
    lg: 48,
  }[size]

  return (
    <Link
      href={href}
      className={cn('inline-flex items-center gap-2.5 transition hover:opacity-95', className)}
      aria-label="Gauss Maths home"
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-full shadow-sm ring-1 ring-black/10"
        style={{ width: dim, height: dim }}
      >
        <Image
          src="/images/logo.png"
          alt="Gauss Maths"
          width={dim * 2}
          height={dim * 2}
          priority
          className="size-full object-cover"
        />
      </div>
      {showText ? (
        <span className={cn('text-lg font-extrabold tracking-tight', light ? 'text-white' : 'text-brand')}>
          Gauss Maths
        </span>
      ) : null}
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
