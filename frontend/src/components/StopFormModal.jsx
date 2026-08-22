import { useState } from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { TextField, TextAreaField, SelectField } from "./ui/Field";
import { toDateInputValue } from "../services/tripService";

// Add or edit one city stop of a trip.
export default function StopFormModal({ open, cities, trip, stop = null, onSave, onClose }) {
  const [values, setValues] = useState(() => makeInitialValues(cities, trip, stop));
  const [errors, setErrors] = useState({});

  // Reset the fields every time the dialog is opened for a different stop.
  const formKey = stop ? stop._id : "new";
  const [activeKey, setActiveKey] = useState(formKey);
  if (open && activeKey !== formKey) {
    setActiveKey(formKey);
    setValues(makeInitialValues(cities, trip, stop));
    setErrors({});
  }

  function updateValue(field, value) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!values.city) nextErrors.city = "Choose a city.";
    if (!values.arrivalDate) nextErrors.arrivalDate = "Select an arrival date.";
    if (!values.departureDate) nextErrors.departureDate = "Select a departure date.";
    if (values.arrivalDate && values.departureDate && values.departureDate < values.arrivalDate) {
      nextErrors.departureDate = "Departure must be on or after arrival.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSave(values);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={stop ? `Edit stop: ${stop.cityName}` : "Add a stop"}
      description="Stops are ordered by the sequence you travel in."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="stop-form">
            {stop ? "Save stop" : "Add stop"}
          </Button>
        </>
      }
    >
      <form id="stop-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <SelectField
          id="stop-city"
          label="City"
          value={values.city}
          error={errors.city}
          onChange={(event) => updateValue("city", event.target.value)}
          options={cities.map((city) => ({
            value: city._id,
            label: `${city.name}, ${city.country}`,
          }))}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="stop-arrival"
            label="Arrival"
            type="date"
            value={values.arrivalDate}
            error={errors.arrivalDate}
            onChange={(event) => updateValue("arrivalDate", event.target.value)}
          />
          <TextField
            id="stop-departure"
            label="Departure"
            type="date"
            value={values.departureDate}
            error={errors.departureDate}
            onChange={(event) => updateValue("departureDate", event.target.value)}
          />
        </div>
        <TextField
          id="stop-accommodation"
          label="Accommodation"
          optional
          value={values.accommodation}
          onChange={(event) => updateValue("accommodation", event.target.value)}
          placeholder="Hotel, hostel or Airbnb"
        />
        <TextAreaField
          id="stop-notes"
          label="Notes"
          optional
          rows={3}
          value={values.notes}
          onChange={(event) => updateValue("notes", event.target.value)}
          placeholder="Anything the group should remember about this city"
        />
      </form>
    </Modal>
  );
}

function makeInitialValues(cities, trip, stop) {
  return {
    city: stop ? stop.city : cities[0] ? cities[0]._id : "",
    arrivalDate: stop ? toDateInputValue(stop.arrivalDate) : toDateInputValue(trip.startDate),
    departureDate: stop ? toDateInputValue(stop.departureDate) : toDateInputValue(trip.endDate),
    accommodation: stop ? stop.accommodation : "",
    notes: stop ? stop.notes : "",
  };
}
