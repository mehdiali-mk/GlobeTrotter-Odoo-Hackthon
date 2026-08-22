import { useEffect, useState } from "react";
import Button from "./ui/Button";
import { TextField, TextAreaField, SelectField, SearchField } from "./ui/Field";
import { toDateInputValue } from "../services/tripService";

// Shared trip form. Used for creating a trip and for editing an existing one.
// Pass `trip` to prefill the fields; leave it out for a new trip.
export default function TripForm({
  id = "trip-form",
  cities,
  trip = null,
  showFirstStop = true,
  placeSearch = false,
  selectedCityId = null,
  onSelectCity,
  onSubmit,
  footer,
}) {
  const [values, setValues] = useState({
    title: trip ? trip.title : "",
    description: trip ? trip.description : "",
    startDate: trip ? toDateInputValue(trip.startDate) : "",
    endDate: trip ? toDateInputValue(trip.endDate) : "",
    totalBudget: trip ? String(trip.totalBudget) : "",
    maxMembers: trip ? String(trip.maxMembers) : "4",
    isPublic: trip ? String(trip.isPublic) : "true",
    coverPhoto: trip ? trip.coverPhoto || "" : "",
    firstCity: selectedCityId || (cities[0] ? cities[0]._id : ""),
    accommodation: "",
  });
  const [errors, setErrors] = useState({});
  const [placeQuery, setPlaceQuery] = useState("");

  // Lets a parent screen (for example the suggestion cards) pick the place.
  useEffect(() => {
    if (selectedCityId) {
      setValues((previous) => ({ ...previous, firstCity: selectedCityId }));
    }
  }, [selectedCityId]);

  const search = placeQuery.trim().toLowerCase();
  const cityOptions = cities.filter(
    (city) =>
      !search || `${city.name} ${city.country} ${city.region}`.toLowerCase().includes(search),
  );
  const placeOptions = (cityOptions.length > 0 ? cityOptions : cities).map((city) => ({
    value: city._id,
    label: `${city.name}, ${city.country}`,
  }));

  function selectCity(cityId) {
    updateValue("firstCity", cityId);
    if (onSelectCity) onSelectCity(cityId);
  }

  function updateValue(field, value) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  }

  function validate() {
    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = "Give the trip a name.";
    if (!values.startDate) nextErrors.startDate = "Select a start date.";
    if (!values.endDate) nextErrors.endDate = "Select an end date.";
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      nextErrors.endDate = "End date must be after the start date.";
    }
    if (values.totalBudget && Number(values.totalBudget) < 0) {
      nextErrors.totalBudget = "Budget cannot be negative.";
    }
    if (Number(values.maxMembers) < 1) {
      nextErrors.maxMembers = "A trip needs at least one member.";
    }
    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(values);
  }

  return (
    <form id={id} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <TextField
        id={`${id}-title`}
        label="Trip name"
        value={values.title}
        error={errors.title}
        onChange={(event) => updateValue("title", event.target.value)}
        placeholder="Team trip to Paris"
      />
      <TextAreaField
        id={`${id}-description`}
        label="Description"
        optional
        rows={3}
        value={values.description}
        onChange={(event) => updateValue("description", event.target.value)}
        placeholder="What is the shape of this trip?"
      />

      <TextField
        id={`${id}-cover`}
        label="Cover photo file name"
        optional
        hint="For example euro_trip.jpg. Uploads arrive with the API."
        value={values.coverPhoto}
        onChange={(event) => updateValue("coverPhoto", event.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={`${id}-start`}
          label="Start date"
          type="date"
          value={values.startDate}
          error={errors.startDate}
          onChange={(event) => updateValue("startDate", event.target.value)}
        />
        <TextField
          id={`${id}-end`}
          label="End date"
          type="date"
          value={values.endDate}
          error={errors.endDate}
          onChange={(event) => updateValue("endDate", event.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={`${id}-budget`}
          label="Total budget"
          type="number"
          min="0"
          value={values.totalBudget}
          error={errors.totalBudget}
          onChange={(event) => updateValue("totalBudget", event.target.value)}
          placeholder="4000"
        />
        <TextField
          id={`${id}-members`}
          label="Max members"
          type="number"
          min="1"
          value={values.maxMembers}
          error={errors.maxMembers}
          onChange={(event) => updateValue("maxMembers", event.target.value)}
        />
      </div>

      {showFirstStop && placeSearch ? (
        <SearchField
          id={`${id}-place-search`}
          label="Search a place"
          placeholder="Search a place, country or region…"
          value={placeQuery}
          onChange={(event) => setPlaceQuery(event.target.value)}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {showFirstStop ? (
          <SelectField
            id={`${id}-first-city`}
            label="Select a place"
            value={values.firstCity}
            onChange={(event) => selectCity(event.target.value)}
            options={placeOptions}
          />
        ) : null}
        <SelectField
          id={`${id}-visibility`}
          label="Visibility"
          value={values.isPublic}
          onChange={(event) => updateValue("isPublic", event.target.value)}
          options={[
            { value: "true", label: "Public plan" },
            { value: "false", label: "Private plan" },
          ]}
        />
      </div>

      {showFirstStop ? (
        <TextField
          id={`${id}-accommodation`}
          label="Accommodation for the first stop"
          optional
          value={values.accommodation}
          onChange={(event) => updateValue("accommodation", event.target.value)}
          placeholder="Airbnb, hotel or hostel name"
        />
      ) : null}

      {footer ? <div className="pt-2">{footer}</div> : null}
    </form>
  );
}

// Convenience submit button so pages do not repeat the form id.
export function TripFormSubmit({ formId, children = "Create trip" }) {
  return (
    <Button type="submit" form={formId}>
      {children}
    </Button>
  );
}
