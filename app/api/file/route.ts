import { type NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { privateFiles } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const pathname = request.nextUrl.searchParams.get('pathname')
  if (!pathname) {
    return NextResponse.json({ error: 'Missing pathname' }, { status: 400 })
  }

  const { role, status, id } = session.user
  const isAdmin = role === 'admin'
  const isApprovedStudent = role === 'student' && status === 'approved'
  const ownSubmission =
    pathname.startsWith(`submissions/${id}/`) || pathname.startsWith(`test-submissions/${id}/`)

  if (!isAdmin && !(isApprovedStudent && ownSubmission)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const [file] = await db.select().from(privateFiles).where(eq(privateFiles.pathname, pathname)).limit(1)
    if (!file) return new NextResponse('Not found', { status: 404 })

    return new NextResponse(new Uint8Array(file.data), {
      headers: {
        'Content-Type': file.contentType,
        'Cache-Control': 'private, no-store',
        'Content-Disposition': `inline; filename="${encodeURIComponent(file.fileName)}"`,
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'Failed to load file' }, { status: 500 })
  }
}
