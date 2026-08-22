// Consistent page title area used by every screen.
export default function PageHeader({ eyebrow, title, description, actions, children }) {
  return (
    <header className="mb-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? <p className="eyebrow mb-1.5">{eyebrow}</p> : null}
          <h1 className="text-2xl text-foreground sm:text-[1.75rem]">{title}</h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </header>
  );
}

export function SectionHeader({ title, description, action }) {
  return (
    <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
