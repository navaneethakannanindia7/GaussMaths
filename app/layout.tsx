import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })

export const metadata: Metadata = {
  title: 'Gauss Maths | Student Portal & Admin',
  description:
    'Gauss Maths learning portal — tests, study resources, homework submissions and progress reports for students, with a separate admin console for teachers.',
}

export const viewport: Viewport = {
  themeColor: '#291b5f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  )
}
