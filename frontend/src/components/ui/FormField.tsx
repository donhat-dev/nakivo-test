import { forwardRef, type ComponentPropsWithoutRef } from 'react'

export interface FormFieldProps extends ComponentPropsWithoutRef<'input'> {
  label: string
  error?: string
  hint?: string
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, error, hint, id, className = '', ...props },
  ref,
) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-signal-ink">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        className={`mt-2 w-full border px-4 py-3 text-sm outline-none transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-signal-muted focus:border-signal-blue ${
          error ? 'border-red-300 bg-red-50' : 'border-signal-line bg-white'
        } ${className}`}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={!!error}
        {...props}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-xs text-signal-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  )
})
