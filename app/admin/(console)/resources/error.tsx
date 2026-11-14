'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { buttonClass } from '@/components/ui'

export default function ResourcesError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[AdminResources] Failed to render resource center', error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-[55vh] max-w-2xl items-center px-4 py-10">
      <section role="alert" className="w-full rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8">
        <span className="grid size-11 place-items-center rounded-xl bg-amber-100 text-amber-900">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-ink">The resource center couldn&apos;t load</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Your resources are unchanged. Retry the page; if the problem continues, share the reference below with support.
        </p>
        {error.digest ? <p className="mt-3 font-mono text-xs text-muted">Reference: {error.digest}</p> : null}
        <button type="button" onClick={reset} className={`${buttonClass.primary} mt-5`}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Retry resource center
        </button>
      </section>
    </main>
  )
}
