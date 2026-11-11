'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteResource, deleteTest } from '@/app/actions/admin'
import { buttonClass } from '@/components/ui'

export function DeleteButton({ id, kind, label }: { id: number; kind: 'resource' | 'test'; label: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={`Delete ${label}`}
      onClick={() => {
        if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return
        startTransition(() => (kind === 'resource' ? deleteResource(id) : deleteTest(id)))
      }}
      className={`${buttonClass.danger} py-1.5`}
    >
      <Trash2 className="size-4" aria-hidden="true" />
      <span className="sr-only sm:not-sr-only">Delete</span>
    </button>
  )
}
