// Generic white surface used for panels, list items and sections.
export default function Card({ as = "div", className = "", children, ...rest }) {
  const Element = as;
  return (
    <Element className={`panel ${className}`} {...rest}>
      {children}
    </Element>
  );
}

export function CardHeader({ title, description, action, className = "" }) {
  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border px-5 py-4 ${className}`}
    >
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
