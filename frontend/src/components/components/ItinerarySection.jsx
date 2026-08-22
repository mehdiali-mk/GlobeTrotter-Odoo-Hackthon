import Card, { CardBody } from "./ui/Card";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import { TextField, TextAreaField, SelectField } from "./ui/Field";
import { formatMoney, countDays } from "../utils/format";

export const sectionTypes = ["City stay", "Travel day", "Activity block", "Rest day"];

// One editable itinerary section: title, description, date range, budget, type.
// Shape: { id, title, description, startDate, endDate, budget, type }
export default function ItinerarySection({ section, index, onChange, onRemove, canRemove }) {
  const idBase = `section-${section.id}`;

  function update(field, value) {
    onChange(section.id, { ...section, [field]: value });
  }

  const days =
    section.startDate && section.endDate ? countDays(section.startDate, section.endDate) : 0;

  return (
    <Card as="section">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <p className="eyebrow">Section {index + 1}</p>
          <h2 className="truncate text-base font-semibold">
            {section.title || "Untitled section"}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone="primary">{formatMoney(Number(section.budget) || 0)}</Badge>
          {canRemove ? (
            <Button variant="danger" size="sm" onClick={() => onRemove(section.id)}>
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      <CardBody className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id={`${idBase}-title`}
            label="Section title"
            placeholder="Paris — city stay"
            value={section.title}
            onChange={(event) => update("title", event.target.value)}
          />
          <SelectField
            id={`${idBase}-type`}
            label="Section type"
            value={section.type}
            onChange={(event) => update("type", event.target.value)}
            options={sectionTypes.map((type) => ({ value: type, label: type }))}
          />
        </div>

        <TextAreaField
          id={`${idBase}-description`}
          label="Description / information"
          rows={3}
          placeholder="What happens in this part of the trip?"
          value={section.description}
          onChange={(event) => update("description", event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            id={`${idBase}-start`}
            label="Start date"
            type="date"
            value={section.startDate}
            onChange={(event) => update("startDate", event.target.value)}
          />
          <TextField
            id={`${idBase}-end`}
            label="End date"
            type="date"
            value={section.endDate}
            onChange={(event) => update("endDate", event.target.value)}
          />
          <TextField
            id={`${idBase}-budget`}
            label="Budget of this section"
            type="number"
            min="0"
            step="10"
            value={section.budget}
            onChange={(event) => update("budget", event.target.value)}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          {days > 0 ? `${days} ${days === 1 ? "day" : "days"} planned` : "Add a date range"} ·{" "}
          {section.type}
        </p>
      </CardBody>
    </Card>
  );
}
