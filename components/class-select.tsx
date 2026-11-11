import { inputClass } from '@/components/ui'
import { CLASS_OPTIONS } from '@/lib/utils'

export function ClassSelect({ id = 'className', allLabel = 'All classes' }: { id?: string; allLabel?: string }) {
  return (
    <select id={id} name="className" defaultValue="" className={inputClass}>
      <option value="">{allLabel}</option>
      {CLASS_OPTIONS.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  )
}
