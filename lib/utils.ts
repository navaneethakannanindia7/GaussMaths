import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const CLASS_OPTIONS = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(date))
}

export function percent(score: number | null, max: number | null) {
  if (score == null || !max) return null
  return Math.round((score / max) * 100)
}

export type FormState = { error?: string; success?: string } | null
