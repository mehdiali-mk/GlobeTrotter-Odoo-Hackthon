import { getInitials } from "../../utils/format";
import { getImageUrl } from "../../utils/images";

const sizeClasses = {
  sm: "h-7 w-7 text-[0.65rem]",
  md: "h-9 w-9 text-xs",
  lg: "h-14 w-14 text-base",
};

export default function Avatar({ name, photo, size = "md", className = "" }) {
  const classes = `shrink-0 overflow-hidden rounded-full border border-border bg-surface-muted ${sizeClasses[size]} ${className}`;

  const photoUrl = getImageUrl(photo);

  if (photoUrl) {
    return <img src={photoUrl} alt={name} loading="lazy" className={`${classes} object-cover`} />;
  }

  return (
    <span
      aria-hidden="true"
      className={`${classes} flex items-center justify-center font-semibold text-muted-foreground`}
    >
      {getInitials(name)}
    </span>
  );
}

// Overlapping avatars for trip members.
export function AvatarGroup({ people, max = 3 }) {
  const visible = people.slice(0, max);
  const hidden = people.length - visible.length;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visible.map((person) => (
          <Avatar
            key={person._id}
            name={person.name}
            photo={person.photo}
            size="sm"
            className="ring-2 ring-surface"
          />
        ))}
      </div>
      {hidden > 0 ? <span className="ml-2 text-xs text-muted-foreground">+{hidden}</span> : null}
    </div>
  );
}
