import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import AuthLayout from "../components/layout/AuthLayout";
import Button from "../components/ui/Button";
import { TextField, TextAreaField } from "../components/ui/Field";
import AuthAside from "../components/AuthAside";
import PhotoUpload from "../components/PhotoUpload";
import { useSignup } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";
import { validateFields, validateProfileField } from "../utils/validation";

const REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "city",
  "country",
  "bio",
  "password",
];

// SCREEN 2 (registration half). Creates a real account in the session dataset.
export default function RegisterPage() {
  const navigate = useNavigate();
  const signupMutation = useSignup();
  const { showToast } = useToast();
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    bio: "",
    photo: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  function updateField(field, value) {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    // Clear the message as soon as the value becomes valid.
    setErrors((previous) => ({
      ...previous,
      [field]: previous[field] ? validateProfileField(field, nextValues) : "",
    }));
    setFormError("");
  }

  function handleBlur(field) {
    setErrors((previous) => ({ ...previous, [field]: validateProfileField(field, values) }));
  }

  function validate() {
    return validateFields(REQUIRED_FIELDS, values);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    signupMutation.mutate(
      {
        name: `${values.firstName.trim()} ${values.lastName.trim()}`,
        email: values.email,
        password: values.password,
        passwordConfirm: values.password, // Added because backend requires it
        phone: values.phone,
        city: values.city,
        country: values.country,
        bio: values.bio,
        photo: values.photo,
      },
      {
        onSuccess: () => {
          showToast(`Welcome to GlobeTrotter!`);
          navigate({ to: "/landing" });
        },
        onError: (error) => {
          setFormError(error.response?.data?.message || "Failed to create account. Please try again.");
        }
      }
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Set up a profile so you can plan trips and invite the people travelling with you."
      aside={<AuthAside />}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <PhotoUpload
          id="register-photo"
          label="Profile photo"
          name={`${values.firstName} ${values.lastName}`.trim()}
          value={values.photo}
          onChange={(photo) => updateField("photo", photo)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="register-first-name"
            label="First name"
            autoComplete="given-name"
            placeholder="Mehdiali"
            value={values.firstName}
            error={errors.firstName}
            onBlur={() => handleBlur("firstName")}
            onChange={(event) => updateField("firstName", event.target.value)}
          />
          <TextField
            id="register-last-name"
            label="Last name"
            autoComplete="family-name"
            placeholder="Kadiwala"
            value={values.lastName}
            error={errors.lastName}
            onBlur={() => handleBlur("lastName")}
            onChange={(event) => updateField("lastName", event.target.value)}
          />
        </div>

        <TextField
          id="register-email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          error={errors.email}
          onBlur={() => handleBlur("email")}
          onChange={(event) => updateField("email", event.target.value)}
        />
        <TextField
          id="register-phone"
          label="Phone number"
          type="tel"
          autoComplete="tel"
          placeholder="+91 90000 00000"
          value={values.phone}
          error={errors.phone}
          onBlur={() => handleBlur("phone")}
          onChange={(event) => updateField("phone", event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="register-city"
            label="City"
            value={values.city}
            error={errors.city}
            onBlur={() => handleBlur("city")}
            onChange={(event) => updateField("city", event.target.value)}
          />
          <TextField
            id="register-country"
            label="Country"
            value={values.country}
            error={errors.country}
            onBlur={() => handleBlur("country")}
            onChange={(event) => updateField("country", event.target.value)}
          />
        </div>

        <TextAreaField
          id="register-bio"
          label="Additional information"
          optional
          rows={3}
          hint="A short line your travel companions will see."
          value={values.bio}
          error={errors.bio}
          onBlur={() => handleBlur("bio")}
          onChange={(event) => updateField("bio", event.target.value)}
        />

        <TextField
          id="register-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          value={values.password}
          error={errors.password}
          onBlur={() => handleBlur("password")}
          onChange={(event) => updateField("password", event.target.value)}
        />

        {formError ? (
          <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{formError}</p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={signupMutation.isPending}>
          {signupMutation.isPending ? "Creating account…" : "Register User"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
