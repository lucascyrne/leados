import { useEffect, useId, useState } from 'react'
import { formatBRL, parseBRLString } from '@/utils/currency'

function formatCurrencyDisplay(n: number | null) {
  if (n == null || !Number.isFinite(n) || n <= 0) return ''
  return formatBRL(n)
}

export type CurrencyInputProps = {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  onBlur?: () => void
  error?: string
  disabled?: boolean
  id?: string
  name?: string
  placeholder?: string
}

export function CurrencyInput({
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  id: idProp,
  name,
  placeholder = 'R$ 0,00',
}: CurrencyInputProps) {
  const genId = useId()
  const id = idProp ?? genId
  const errId = error ? `${id}-error` : undefined

  const [text, setText] = useState(() => formatCurrencyDisplay(value))
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (isFocused) return
    setText(formatCurrencyDisplay(value))
  }, [value, isFocused])

  /** Pipeline Fase 1: `parseBRLString` no commit; `formatBRL` na exibição. */
  function commit(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed) {
      onChange(null)
      setText('')
      return
    }
    const n = parseBRLString(trimmed)
    if (!Number.isFinite(n) || n <= 0) {
      onChange(null)
      setText('')
      return
    }
    onChange(n)
    setText(formatCurrencyDisplay(n))
  }

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label htmlFor={id} className="text-foreground text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={text}
        onFocus={() => setIsFocused(true)}
        onChange={(e) => {
          setText(e.target.value)
        }}
        onBlur={() => {
          setIsFocused(false)
          commit(text)
          onBlur?.()
        }}
        aria-invalid={error ? true : undefined}
        aria-describedby={errId}
        className={
          'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ' +
          (error ? 'border-destructive' : '')
        }
      />
      {error ? (
        <p id={errId} className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
