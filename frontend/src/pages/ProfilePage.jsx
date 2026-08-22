import { useState } from "react";
import PageHeader, { SectionHeader } from "../components/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Button, { ButtonLink } from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import { TextField, TextAreaField } from "../components/ui/Field";
import PhotoUpload from "../components/PhotoUpload";
import CityCard from "../components/CityCard";
import TripCard from "../components/TripCard";
import { EmptyState } from "../components/ui/States";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../utils/format";
import { validateFields, validateProfileField } from "../utils/validation";

const EDITABLE_FIELDS = ["firstName", "lastName", "email", "phone", "city", "country", "bio"];

// Splits "Mehdiali Kadiwala" into the first and last name fields.
function splitName(fullName) {
  const parts = String(fullName || "")
    .trim()
    .split(" ");
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") };
}

// Stored numbers may carry a country code, but the field itself holds the 10
// local digits, which is what the validation rules expect.
function toLocalDigits(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) return digits.slice(-10);
  return digits;
}

function buildFormValues(user) {
  const { firstName, lastName } = splitName(user.name);
  return {
    firstName,
    lastName,
    email: user.email || "",
    phone: toLocalDigits(user.phone),
    city: user.city || "",
    country: user.country || "",
    bio: user.bio || "",
    photo: user.photo || "",
  };
}

// Screen 7 — user profile with an edit mode, preplanned trips and past trips.
export default function ProfilePage() {
  const data = useAppData();
  const { showToast } = useToast();
  const user = data.currentUser;
  const trips = data.getMyTrips();

  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState(() => buildFormValues(user));
  const [errors, setErrors] = useState({});

  const savedCities = (user.savedDestinations || [])
    .map((cityId) => data.getCityById(cityId))
    .filter(Boolean);

  const preplannedTrips = trips.filter(
    (trip) => trip.status === "upcoming" || trip.status === "ongoing",
  );
  const previousTrips = trips.filter((trip) => trip.status === "completed");

  function updateField(field, value) {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    setErrors((previous) => ({
      ...previous,
      [field]: previous[field] ? validateProfileField(field, nextValues) : "",
    }));
  }

  function handleBlur(field) {
    setErrors((previous) => ({ ...previous, [field]: validateProfileField(field, values) }));
  }

  function startEditing() {
    setValues(buildFormValues(user));
    setErrors({});
    setIsEditing(true);
  }

  // Cancelling restores the saved profile values, so nothing invalid sticks.
  function cancelEditing() {
    setValues(buildFormValues(user));
    setErrors({});
    setIsEditing(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateFields(EDITABLE_FIELDS, values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    data.updateProfile({
      name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      city: values.city.trim(),
      country: values.country.trim(),
      bio: values.bio.trim(),
      photo: values.photo,
    });

    showToast("Profile updated");
    setIsEditing(false);
  }

  const details = [
    { label: "First name", value: values.firstName },
    { label: "Last name", value: values.lastName || "—" },
    { label: "Email", value: user.email },
    { label: "Phone number", value: user.phone || "—" },
    { label: "City", value: user.city || "—" },
    { label: "Country", value: user.country || "—" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Profile"
        title="Your account"
        description="Details shown to the people you travel with."
        actions={
          isEditing ? null : (
            <Button variant="secondary" onClick={startEditing}>
              Edit profile
            </Button>
          )
        }
      />

      <Card as="section" className="mb-8">
        <CardBody>
          <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
            <div className="flex flex-col items-center gap-3">
              <div className="overflow-hidden rounded-full">
                <Avatar name={user.name} photo={user.photo} size="lg" />
              </div>
              <Badge tone={user.role === "admin" ? "primary" : "neutral"}>
                {user.role === "admin" ? "Administrator" : "Traveller"}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <PhotoUpload
                  value={values.photo}
                  name={`${values.firstName} ${values.lastName}`}
                  onChange={(next) => updateField("photo", next)}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id="profile-first-name"
                    label="First name"
                    value={values.firstName}
                    error={errors.firstName}
                    onBlur={() => handleBlur("firstName")}
                    onChange={(event) => updateField("firstName", event.target.value)}
                  />
                  <TextField
                    id="profile-last-name"
                    label="Last name"
                    value={values.lastName}
                    error={errors.lastName}
                    onBlur={() => handleBlur("lastName")}
                    onChange={(event) => updateField("lastName", event.target.value)}
                  />
                  <TextField
                    id="profile-email"
                    label="Email"
                    type="email"
                    value={values.email}
                    error={errors.email}
                    onBlur={() => handleBlur("email")}
                    onChange={(event) => updateField("email", event.target.value)}
                  />
                  <TextField
                    id="profile-phone"
                    label="Phone number"
                    value={values.phone}
                    error={errors.phone}
                    onBlur={() => handleBlur("phone")}
                    onChange={(event) => updateField("phone", event.target.value)}
                  />
                  <TextField
                    id="profile-city"
                    label="City"
                    value={values.city}
                    error={errors.city}
                    onBlur={() => handleBlur("city")}
                    onChange={(event) => updateField("city", event.target.value)}
                  />
                  <TextField
                    id="profile-country"
                    label="Country"
                    value={values.country}
                    error={errors.country}
                    onBlur={() => handleBlur("country")}
                    onChange={(event) => updateField("country", event.target.value)}
                  />
                </div>
                <TextAreaField
                  id="profile-bio"
                  label="Additional information"
                  optional
                  value={values.bio}
                  error={errors.bio}
                  onBlur={() => handleBlur("bio")}
                  onChange={(event) => updateField("bio", event.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="submit">Save changes</Button>
                  <Button variant="secondary" onClick={cancelEditing}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div>
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {user.city}, {user.country}
                </p>

                <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {details.map((detail) => (
                    <div key={detail.label}>
                      <dt className="eyebrow">{detail.label}</dt>
                      <dd className="mt-0.5 truncate text-sm font-medium">{detail.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 border-t border-border pt-4">
                  <p className="eyebrow">Additional information</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {user.bio || "Nothing added yet."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <section className="mb-8">
        <SectionHeader
          title="Preplanned trips"
          description={`${preplannedTrips.length} upcoming or ongoing`}
          action={
            <ButtonLink to="/trips" variant="secondary" size="sm">
              All trips
            </ButtonLink>
          }
        />
        {preplannedTrips.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {preplannedTrips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                stops={data.getStopsForTrip(trip._id)}
                members={data.getMembersForTrip(trip)}
                actions={
                  <ButtonLink to="/trips/$tripId" params={{ tripId: trip._id }} size="sm">
                    View
                  </ButtonLink>
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No planned trips"
            message="Start a new trip and it will show up here."
            action={<ButtonLink to="/create-trip">Create trip</ButtonLink>}
          />
        )}
      </section>

      <section className="mb-8">
        <SectionHeader title="Previous trips" description={`${previousTrips.length} completed`} />
        {previousTrips.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {previousTrips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                stops={data.getStopsForTrip(trip._id)}
                members={data.getMembersForTrip(trip)}
                actions={
                  <ButtonLink to="/trips/$tripId" params={{ tripId: trip._id }} size="sm">
                    View
                  </ButtonLink>
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Completed trips will be listed here once your dates pass.
          </p>
        )}
      </section>

      <section>
        <SectionHeader
          title="Saved destinations"
          description={`${savedCities.length} saved from Discover`}
        />
        {savedCities.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {savedCities.map((city) => (
              <CityCard
                key={city._id}
                city={city}
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      data.toggleSavedDestination(city._id);
                      showToast(`${city.name} removed from saved`);
                    }}
                  >
                    Remove
                  </Button>
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Save cities from Discover to keep them here.
          </p>
        )}
      </section>
    </>
  );
}
