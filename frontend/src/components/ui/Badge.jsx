const toneClasses = {
  neutral: "bg-surface-muted text-muted-foreground border-border",
  primary: "bg-primary-soft text-primary border-primary/20",
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/20",
  danger: "bg-danger-soft text-danger border-danger/20",
};

export default function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// Trip status uses a fixed tone per status so it reads the same everywhere.
const statusTones = { upcoming: "primary", ongoing: "success", completed: "neutral" };
const statusLabels = { upcoming: "Upcoming", ongoing: "Ongoing", completed: "Completed" };

export function StatusBadge({ status }) {
  return <Badge tone={statusTones[status] || "neutral"}>{statusLabels[status] || status}</Badge>;
}
