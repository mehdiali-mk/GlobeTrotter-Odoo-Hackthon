import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import AuthLayout from "../components/layout/AuthLayout";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import { TextField } from "../components/ui/Field";
import AuthAside from "../components/AuthAside";
import { useAppData } from "../context/AppDataContext";
import { validateEmail, validateLoginPassword } from "../utils/validation";

// SCREEN 2 (login half). Uses the demo authentication layer in the app data context.
export default function LoginPage() {
  const navigate = useNavigate();
  const data = useAppData();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const matchedUser = data.users.find(
    (person) => person.email.toLowerCase() === values.email.trim().toLowerCase(),
  );

  function checkField(field, nextValues) {
    if (field === "email") return validateEmail(nextValues.email);
    if (field === "password") return validateLoginPassword(nextValues.password);
    return "";
  }

  function updateField(field, value) {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    // While typing, keep the message only if the field is still invalid.
    setErrors((previous) => ({
      ...previous,
      [field]: previous[field] ? checkField(field, nextValues) : "",
    }));
    setFormError("");
  }

  function handleBlur(field) {
    setErrors((previous) => ({ ...previous, [field]: checkField(field, values) }));
  }

  function validate() {
    const nextErrors = {};
    const emailError = validateEmail(values.email);
    if (emailError) nextErrors.email = emailError;
    const passwordError = validateLoginPassword(values.password);
    if (passwordError) nextErrors.password = passwordError;
    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const result = data.signIn(values.email, values.password);
    if (!result.ok) {
      setIsSubmitting(false);
      setFormError(result.message);
      return;
    }
    navigate({ to: "/landing" });
  }

  return (
    <AuthLayout
      title="Sign in to GlobeTrotter"
      description="Continue planning your trips, itineraries and shared budgets."
      aside={<AuthAside />}
    >
      <div className="mb-6 flex items-center gap-4 rounded-lg border border-border bg-surface-muted p-3">
        <Avatar
          name={matchedUser ? matchedUser.name : "Traveller"}
          photo={matchedUser ? matchedUser.photo : ""}
          size="lg"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {matchedUser ? matchedUser.name : "Your profile"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {matchedUser ? matchedUser.email : "Your photo appears once we recognise your email."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <TextField
          id="login-email"
          label="Username"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          error={errors.email}
          onBlur={() => handleBlur("email")}
          onChange={(event) => updateField("email", event.target.value)}
        />
        <TextField
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={values.password}
          error={errors.password}
          onBlur={() => handleBlur("password")}
          onChange={(event) => updateField("password", event.target.value)}
        />

        {formError ? (
          <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{formError}</p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Login"}
        </Button>
      </form>

      <div className="mt-6 rounded-lg border border-border bg-surface-muted p-4">
        <p className="eyebrow">Demo accounts</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Any password works while the API is not connected yet.
        </p>
        <div className="mt-3 space-y-1.5">
          {data.users.map((person) => (
            <button
              key={person._id}
              type="button"
              onClick={() => setValues({ email: person.email, password: "demo1234" })}
              className="flex w-full items-center justify-between gap-2 rounded-md bg-surface px-3 py-2 text-left text-sm hover:bg-primary-soft"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{person.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{person.email}</span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{person.role}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        New to GlobeTrotter?{" "}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}
