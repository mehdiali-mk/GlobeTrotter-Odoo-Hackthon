import { SearchField, SelectField } from "./Field";

// Reusable toolbar used by every listing screen: one search field plus any
// number of dropdown controls (Group by / Filter / Sort by).
// controls: [{ id, label, value, onChange, options }]
export default function Toolbar({
  searchId,
  searchLabel = "Search",
  searchPlaceholder = "Search…",
  searchValue,
  onSearchChange,
  controls = [],
  children,
  className = "",
}) {
  return (
    <div className={`panel mb-6 p-4 ${className}`}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
        {onSearchChange ? (
          <SearchField
            id={searchId}
            label={searchLabel}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            className="self-end"
          />
        ) : null}

        {controls.map((control) => (
          <SelectField
            key={control.id}
            id={control.id}
            label={control.label}
            value={control.value}
            onChange={(event) => control.onChange(event.target.value)}
            options={control.options}
          />
        ))}
      </div>
      {children ? <div className="mt-4 border-t border-border pt-4">{children}</div> : null}
    </div>
  );
}
