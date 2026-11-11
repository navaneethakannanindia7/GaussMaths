'use client'

import { useTransition } from 'react'
import { setStudentStatus } from '@/app/actions/admin'
import { buttonClass } from '@/components/ui'

export function StudentStatusButtons({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition()
  const update = (next: 'approved' | 'rejected' | 'pending') => startTransition(() => setStudentStatus(id, next))

  return (
    <div className="flex flex-wrap gap-2">
      {status !== 'approved' ? (
        <button type="button" disabled={pending} onClick={() => update('approved')} className={`${buttonClass.lime} px-3 py-1.5`}>
          Approve
        </button>
      ) : null}
      {status !== 'rejected' ? (
        <button type="button" disabled={pending} onClick={() => update('rejected')} className={`${buttonClass.danger} py-1.5`}>
          {status === 'approved' ? 'Revoke' : 'Reject'}
        </button>
      ) : (
        <button type="button" disabled={pending} onClick={() => update('pending')} className={`${buttonClass.outline} px-3 py-1.5`}>
          Move to pending
        </button>
      )}
    </div>
  )
}
