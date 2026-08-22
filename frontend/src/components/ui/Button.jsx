import { Link } from "@tanstack/react-router";

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const variantClasses = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary: "bg-surface text-foreground border border-border-strong hover:bg-surface-muted",
  ghost: "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
  danger: "bg-danger-soft text-danger border border-danger/20 hover:bg-danger/10",
};

const sizeClasses = {
  sm: "h-8 px-3",
  md: "h-10 px-4",
  lg: "h-11 px-5 text-[0.95rem]",
};

function getClasses(variant, size, className) {
  return [baseClasses, variantClasses[variant], sizeClasses[size], className]
    .filter(Boolean)
    .join(" ");
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  children,
  ...rest
}) {
  return (
    <button type={type} className={getClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

// Same visual treatment for navigation actions.
export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}) {
  return (
    <Link className={getClasses(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
