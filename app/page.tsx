import Link from 'next/link'
import { ArrowRight, BookOpen, ClipboardCheck, FileText, LineChart, ShieldCheck, GraduationCap } from 'lucide-react'
import { Logo } from '@/components/logo'
import { buttonClass } from '@/components/ui'
import { getSession } from '@/lib/session'

const FEATURES = [
  { icon: FileText, title: 'Online tests', text: 'Download question papers and upload your answer sheet from any device.' },
  { icon: ClipboardCheck, title: 'Homework review', text: 'Submit homework as a PDF or photo and get marks with feedback.' },
  { icon: BookOpen, title: 'Study resources', text: 'Notes, important questions and previous year papers in one place.' },
  { icon: LineChart, title: 'Progress reports', text: 'See every score and your average improve over time.' },
]

export default async function HomePage() {
  const session = await getSession()
  const dashboard = session?.user ? (session.user.role === 'admin' ? '/admin' : '/portal') : null

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-brand">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Logo light />
          <nav aria-label="Main" className="flex items-center gap-2">
            {dashboard ? (
              <Link href={dashboard} className={buttonClass.lime}>
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link href="/admin/login" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:text-white sm:inline-flex">
                  Admin
                </Link>
                <Link href="/sign-in" className={buttonClass.lime}>
                  Student login
                </Link>
              </>
            )}
          </nav>
        </div>

        <section className="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:pt-16 sm:pb-28">
          <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-lime">
            Maths coaching · Classes 6–12
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white text-balance sm:text-6xl">
            Learn maths with clarity. Track every step of progress.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75 text-pretty">
            The Gauss Maths portal brings tests, homework, study material and report cards together for students — with a separate,
            secure console for teachers.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/sign-up" className={`${buttonClass.lime} px-5 py-3 text-base`}>
              Register as student <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/sign-in" className="inline-flex items-center rounded-lg border border-white/25 px-5 py-3 text-base font-semibold text-white hover:bg-white/10">
              Student sign in
            </Link>
          </div>
        </section>
      </header>

      <main className="flex-1">
        <section aria-labelledby="portals" className="mx-auto -mt-12 grid max-w-6xl gap-5 px-5 md:grid-cols-2">
          <h2 id="portals" className="sr-only">
            Choose your portal
          </h2>
          <div className="rounded-2xl border border-line bg-card p-6 shadow-lg sm:p-8">
            <span className="grid size-12 place-items-center rounded-xl bg-lime text-brand">
              <GraduationCap className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-xl font-bold text-ink">Student portal</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Register with your class, get approved by your teacher, then access tests, resources and your report card.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/sign-in" className={buttonClass.primary}>
                Sign in
              </Link>
              <Link href="/sign-up" className={buttonClass.outline}>
                Register
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-brand bg-brand-soft p-6 text-white shadow-lg sm:p-8">
            <span className="grid size-12 place-items-center rounded-xl bg-white/10 text-lime">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-xl font-bold">Admin access</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              For Gauss Maths staff only. Approve students, publish tests, upload resources and grade submissions.
            </p>
            <div className="mt-5">
              <Link href="/admin/login" className={buttonClass.lime}>
                Admin sign in
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="features" className="mx-auto max-w-6xl px-5 py-20">
          <h2 id="features" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Everything a student needs
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-line bg-card p-5">
                <f.icon className="size-6 text-brand" aria-hidden="true" />
                <h3 className="mt-3 font-semibold text-ink">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-sm text-muted sm:flex-row sm:justify-between">
          <p>{`© ${new Date().getFullYear()} Gauss Maths`}</p>
          <a href="mailto:gaussmaths26@gmail.com" className="hover:text-ink">
            gaussmaths26@gmail.com
          </a>
        </div>
      </footer>
    </div>
  )
}
