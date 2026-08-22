import { BrandMark } from "./Sidebar";

// Two column layout for login and registration.
export default function AuthLayout({ title, description, children, aside }) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <div className="flex flex-col px-5 py-8 sm:px-10 lg:px-16">
        <BrandMark />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-2xl sm:text-[1.75rem]">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <div className="mt-7">{children}</div>
        </div>
      </div>

      <div className="hidden border-l border-border bg-surface px-16 py-16 lg:flex lg:flex-col lg:justify-center">
        {aside}
      </div>
    </div>
  );
}
