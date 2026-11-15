import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { submissions, user } from '@/lib/db/schema'
import { EmptyState, PageHeader, StatCard } from '@/components/ui'
import { TestSubmissionCard } from '@/components/admin/test-submission-card'

export const metadata = { title: 'Test submissions | Gauss Maths Admin' }

export default async function TestSubmissionsPage() {
  const rows = await db
    .select({
      id: submissions.id,
      title: submissions.title,
      chapter: submissions.chapter,
      pathname: submissions.pathname,
      fileName: submissions.fileName,
      createdAt: submissions.createdAt,
      studentName: user.name,
      studentClass: user.className,
      studentEmail: user.email,
    })
    .from(submissions)
    .innerJoin(user, eq(user.id, submissions.userId))
    .where(eq(submissions.kind, 'test'))
    .orderBy(desc(submissions.createdAt))

  return (
    <>
      <PageHeader
        title="Test submissions"
        description="Student-uploaded test answer sheets, with each student’s name, class, and email."
      />

      <div className="mb-6 max-w-xs">
        <StatCard label="Test submissions" value={rows.length} />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No test submissions yet"
          description="Student answer sheets will appear here after they submit a test."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((submission) => (
            <TestSubmissionCard key={submission.id} submission={submission} />
          ))}
        </div>
      )}
    </>
  )
}
