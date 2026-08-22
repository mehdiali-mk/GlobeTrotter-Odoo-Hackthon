import { ButtonLink } from "./Button";

// Skeleton block used inside loading layouts.
function SkeletonLine({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export function LoadingState({ rows = 3, label = "Loading" }) {
  const items = Array.from({ length: rows });
  return (
    <div className="space-y-3" role="status" aria-live="polite" aria-label={label}>
      {items.map((item, index) => (
        <div key={index} className="panel p-5">
          <SkeletonLine className="h-4 w-1/3" />
          <SkeletonLine className="mt-3 h-3 w-2/3" />
          <SkeletonLine className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function CardGridLoadingState({ cards = 3 }) {
  const items = Array.from({ length: cards });
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-live="polite">
      {items.map((item, index) => (
        <div key={index} className="panel overflow-hidden">
          <SkeletonLine className="h-36 w-full rounded-none" />
          <div className="p-4">
            <SkeletonLine className="h-4 w-2/3" />
            <SkeletonLine className="mt-3 h-3 w-full" />
            <SkeletonLine className="mt-2 h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StateShell({ icon, title, message, action, tone = "neutral" }) {
  const iconTone =
    tone === "danger" ? "bg-danger-soft text-danger" : "bg-surface-muted text-muted-foreground";

  return (
    <div className="panel flex flex-col items-center px-6 py-12 text-center">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${iconTone}`}>
        {icon}
      </div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <StateShell
      title={title}
      message={message}
      action={action}
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 7h16M4 12h10M4 17h7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      }
    />
  );
}

export function ErrorState({
  title = "Something went wrong",
  message = "The information could not be loaded. Please try again.",
  action,
}) {
  return (
    <StateShell
      tone="danger"
      title={title}
      message={message}
      action={action}
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="1.1" fill="currentColor" />
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        </svg>
      }
    />
  );
}

export function NotFoundState({
  title = "Not found",
  message = "This page or record does not exist, or it is no longer shared.",
  backTo = "/dashboard",
  backLabel = "Back to dashboard",
}) {
  return (
    <StateShell
      title={title}
      message={message}
      action={
        <ButtonLink to={backTo} variant="secondary">
          {backLabel}
        </ButtonLink>
      }
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      }
    />
  );
}
