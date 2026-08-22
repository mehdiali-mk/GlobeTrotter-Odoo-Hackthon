// Form primitives: label + control + optional error message.

const controlClasses =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtle-foreground focus:border-primary focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-ring/30";

export function FieldLabel({ htmlFor, children, optional = false }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
      {children}
      {optional ? <span className="ml-1 text-xs text-subtle-foreground">(optional)</span> : null}
    </label>
  );
}

export function FieldError({ message, id }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-danger">
      {message}
    </p>
  );
}

export function TextField({ id, label, error, optional, hint, className = "", ...rest }) {
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} optional={optional}>
        {label}
      </FieldLabel>
      <input
        id={id}
        className={controlClasses}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {hint && !error ? <p className="mt-1.5 text-xs text-subtle-foreground">{hint}</p> : null}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export function TextAreaField({ id, label, error, optional, rows = 4, className = "", ...rest }) {
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} optional={optional}>
        {label}
      </FieldLabel>
      <textarea
        id={id}
        rows={rows}
        className={controlClasses}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export function SelectField({ id, label, error, options, className = "", ...rest }) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select id={id} className={controlClasses} {...rest}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function SearchField({ id, label, className = "", ...rest }) {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle-foreground">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <input id={id} type="search" className={`${controlClasses} pl-9`} {...rest} />
    </div>
  );
}
