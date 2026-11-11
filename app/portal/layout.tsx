import { Clock, ShieldAlert } from 'lucide-react'
import { DashboardShell } from '@/components/dashboard-shell'
import { Card } from '@/components/ui'
import { requireStudent } from '@/lib/session'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const student = await requireStudent()
  const approved = student.status === 'approved'

  return (
    <DashboardShell
      variant="student"
      userName={student.name}
      userMeta={student.className ?? student.email}
      showNav={approved}
    >
      {approved ? (
        children
      ) : (
        <Card className="mx-auto mt-10 max-w-lg text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-brand/10 text-brand">
            {student.status === 'rejected' ? <ShieldAlert className="size-6" aria-hidden="true" /> : <Clock className="size-6" aria-hidden="true" />}
          </div>
          <h1 className="mt-4 text-xl font-bold text-ink">
            {student.status === 'rejected' ? 'Access not approved' : 'Waiting for approval'}
          </h1>
          <p className="mt-2 text-sm text-muted text-pretty">
            {student.status === 'rejected'
              ? 'Your registration was not approved. Please contact Gauss Maths at gaussmaths26@gmail.com if you think this is a mistake.'
              : `Thanks for registering, ${student.name}. Your teacher will approve your account shortly. Refresh this page after approval to access your tests and resources.`}
          </p>
        </Card>
      )}
    </DashboardShell>
  )
}
