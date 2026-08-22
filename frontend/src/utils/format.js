// Small formatting helpers used across screens.

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatShortDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return "Dates not set";
  return `${formatShortDate(startDate)} – ${formatDate(endDate)}`;
}

export function formatMoney(amount) {
  if (amount === null || amount === undefined) return "—";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export function formatHours(hours) {
  if (!hours) return "—";
  // The catalog stores durations as text such as "2.5 hours".
  if (typeof hours === "string") return hours;
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

// Turns "09:00 AM" into minutes since midnight so times can be sorted.
export function parseTimeToMinutes(timeText) {
  if (!timeText) return 0;
  const match = String(timeText).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const suffix = match[3] ? match[3].toUpperCase() : "";
  if (suffix === "PM" && hours !== 12) hours += 12;
  if (suffix === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function countNights(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const difference = new Date(endDate).getTime() - new Date(startDate).getTime();
  return Math.max(0, Math.round(difference / MILLISECONDS_PER_DAY));
}

export function countDays(startDate, endDate) {
  return countNights(startDate, endDate) + 1;
}

export function daysUntil(dateValue) {
  const difference = new Date(dateValue).getTime() - Date.now();
  return Math.ceil(difference / MILLISECONDS_PER_DAY);
}

export function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}
