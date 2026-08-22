import { useState } from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { TextField, SelectField } from "./ui/Field";
import { toDateInputValue } from "../services/tripService";

export const activityCategories = [
  "Sightseeing",
  "Food",
  "Adventure",
  "Culture",
  "Relaxation",
  "Other",
];

const timeOptions = [
  "07:00 AM",
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "04:00 PM",
  "06:00 PM",
  "08:00 PM",
];

// Add or edit an activity inside one stop of the itinerary.
export default function ActivityFormModal({
  open,
  stop,
  activity = null,
  catalog = [],
  onSave,
  onClose,
}) {
  const [values, setValues] = useState(() => makeInitialValues(stop, activity));
  const [errors, setErrors] = useState({});

  const formKey = activity ? activity._id : `new-${stop ? stop._id : "stop"}`;
  const [activeKey, setActiveKey] = useState(formKey);
  if (open && activeKey !== formKey) {
    setActiveKey(formKey);
    setValues(makeInitialValues(stop, activity));
    setErrors({});
  }

  const cityCatalog = stop ? catalog.filter((item) => item.city === stop.city) : [];

  function updateValue(field, value) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  }

  // Picking a catalog activity prefills the title, cost and category.
  function pickFromCatalog(catalogId) {
    const picked = cityCatalog.find((item) => item._id === catalogId);
    if (!picked) {
      updateValue("catalogActivity", "");
      return;
    }
    setValues((previous) => ({
      ...previous,
      catalogActivity: picked._id,
      title: picked.title,
      category: picked.category,
      cost: String(picked.cost),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = "Give the activity a name.";
    if (!values.scheduledDate) nextErrors.scheduledDate = "Pick the day.";
    if (Number(values.cost) < 0) nextErrors.cost = "Cost cannot be negative.";
    if (!(Number(values.durationHours) > 0)) nextErrors.durationHours = "Enter a duration.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSave(values);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={activity ? "Edit activity" : `Add activity${stop ? ` in ${stop.cityName}` : ""}`}
      description="Scheduled activities appear in the itinerary, calendar and budget."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="activity-form">
            {activity ? "Save activity" : "Add activity"}
          </Button>
        </>
      }
    >
      <form id="activity-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {!activity && cityCatalog.length > 0 ? (
          <SelectField
            id="activity-catalog"
            label="Start from the catalog"
            value={values.catalogActivity}
            onChange={(event) => pickFromCatalog(event.target.value)}
            options={[
              { value: "", label: "Custom activity" },
              ...cityCatalog.map((item) => ({
                value: item._id,
                label: `${item.title} · $${item.cost}`,
              })),
            ]}
          />
        ) : null}

        <TextField
          id="activity-title"
          label="Activity"
          value={values.title}
          error={errors.title}
          onChange={(event) => updateValue("title", event.target.value)}
          placeholder="Museum visit, team dinner, day trip"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="activity-category"
            label="Category"
            value={values.category}
            onChange={(event) => updateValue("category", event.target.value)}
            options={activityCategories.map((value) => ({ value, label: value }))}
          />
          <TextField
            id="activity-cost"
            label="Cost (USD)"
            type="number"
            min="0"
            value={values.cost}
            error={errors.cost}
            onChange={(event) => updateValue("cost", event.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            id="activity-date"
            label="Date"
            type="date"
            value={values.scheduledDate}
            error={errors.scheduledDate}
            onChange={(event) => updateValue("scheduledDate", event.target.value)}
          />
          <SelectField
            id="activity-time"
            label="Start time"
            value={values.startTime}
            onChange={(event) => updateValue("startTime", event.target.value)}
            options={timeOptions.map((value) => ({ value, label: value }))}
          />
          <TextField
            id="activity-duration"
            label="Hours"
            type="number"
            min="0.5"
            step="0.5"
            value={values.durationHours}
            error={errors.durationHours}
            onChange={(event) => updateValue("durationHours", event.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}

function makeInitialValues(stop, activity) {
  return {
    catalogActivity: activity ? activity.catalogActivity || "" : "",
    title: activity ? activity.title : "",
    category: activity ? activity.category : "Sightseeing",
    cost: activity ? String(activity.cost) : "0",
    scheduledDate: activity
      ? toDateInputValue(activity.scheduledDate)
      : stop
        ? toDateInputValue(stop.arrivalDate)
        : "",
    startTime: activity ? activity.startTime : "10:00 AM",
    durationHours: activity ? String(activity.durationHours) : "2",
  };
}
