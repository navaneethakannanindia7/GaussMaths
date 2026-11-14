'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { buttonClass, Card } from '@/components/ui'

export default function StudentResourcesError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[StudentResources] Failed to render resource page', error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-[55vh] max-w-2xl items-center px-4 py-10">
      <Card className="w-full p-6 sm:p-8">
        <span className="grid size-11 place-items-center rounded-xl bg-amber-100 text-amber-900">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-ink">Resources couldn&apos;t load</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Try again. If the problem continues, contact your teacher and share the reference below.
        </p>
        {error.digest ? <p className="mt-3 font-mono text-xs text-muted">Reference: {error.digest}</p> : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className={buttonClass.primary}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </button>
          <Link href="/portal" className={buttonClass.outline}>
            Back to dashboard
          </Link>
        </div>
      </Card>
    </main>
  )
}
