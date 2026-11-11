'use client'

import { useActionState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { buttonClass } from '@/components/ui'
import type { FormState } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>
  submitLabel: string
  pendingLabel?: string
  variant?: keyof typeof buttonClass
  className?: string
  resetOnSuccess?: boolean
  children?: React.ReactNode
}

export function ActionForm({
  action,
  submitLabel,
  pendingLabel = 'Saving…',
  variant = 'primary',
  className,
  resetOnSuccess = true,
  children,
}: Props) {
  const [state, formAction, pending] = useActionState(action, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success && resetOnSuccess) formRef.current?.reset()
  }, [state, resetOnSuccess])

  return (
    <form ref={formRef} action={formAction} className={cn('flex flex-col gap-4', className)}>
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClass[variant]}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? pendingLabel : submitLabel}
        </button>
        <p aria-live="polite" className="text-sm">
          {state?.error ? <span className="text-danger">{state.error}</span> : null}
          {state?.success ? <span className="text-emerald-700">{state.success}</span> : null}
        </p>
      </div>
    </form>
  )
}
