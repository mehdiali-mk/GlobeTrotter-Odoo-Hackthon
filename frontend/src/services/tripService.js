// Pure data helpers used by the app data context.
// Part 5 replaces the callers of these helpers with API calls; the shapes stay
// exactly the same as the provided dataset.

// --- small utilities -------------------------------------------------------

export function findById(list, id) {
  return list.find((item) => item._id === id) || null;
}

export function makeId(prefix) {
  const random = Math.round(Math.random() * 10000);
  return `${prefix}_${Date.now()}_${random}`;
}

// Form inputs are "YYYY-MM-DD"; the dataset stores full ISO strings.
export function toIsoDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

// Turns an ISO string back into the value a date input expects.
export function toDateInputValue(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function makeJoinCode(title) {
  const letters = slugify(title).replace(/-/g, "").slice(0, 4).toUpperCase() || "TRIP";
  return `${letters}${new Date().getFullYear()}`;
}

// upcoming / ongoing / completed is derived from the dates, never typed by hand.
export function getStatusFromDates(startDate, endDate) {
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return "upcoming";
  if (end < now) return "completed";
  if (start <= now) return "ongoing";
  return "upcoming";
}

// Day 1 is the trip start date.
export function getDayNumber(tripStartDate, scheduledDate) {
  const start = new Date(toDateInputValue(tripStartDate)).getTime();
  const day = new Date(toDateInputValue(scheduledDate)).getTime();
  if (Number.isNaN(start) || Number.isNaN(day)) return 1;
  return Math.max(1, Math.round((day - start) / 86400000) + 1);
}

// --- selectors -------------------------------------------------------------

// The dataset keeps members as objects. Screens only need the accepted user
// ids, and the creator is always part of the trip.
export function normalizeTrip(trip) {
  if (!trip) return null;
  const acceptedMembers = (trip.members || [])
    .filter((member) => member.status === "accepted")
    .map((member) => member.user);

  return {
    ...trip,
    members: [trip.creator, ...acceptedMembers],
    memberRoles: trip.members || [],
  };
}

export function normalizeTrips(tripList) {
  return tripList.map(normalizeTrip);
}

export function filterTripsForUser(normalizedTrips, userId) {
  return normalizedTrips.filter((trip) => trip.creator === userId || trip.members.includes(userId));
}

export function filterStopsForTrip(stopList, tripId) {
  return stopList
    .filter((stop) => stop.trip === tripId)
    .sort((first, second) => first.stopOrder - second.stopOrder);
}

export function filterActivitiesForTrip(activityList, tripId) {
  return activityList.filter((activity) => activity.trip === tripId);
}

export function filterActivitiesForStop(activityList, stopId) {
  return activityList.filter((activity) => activity.stop === stopId);
}

export function filterExpensesForTrip(expenseList, tripId) {
  return expenseList.filter((expense) => expense.trip === tripId);
}

export function uniqueValues(values) {
  return values.filter((value, index) => values.indexOf(value) === index).sort();
}

// --- record factories ------------------------------------------------------

export function createTripRecord(values, creatorId) {
  const startDate = toIsoDate(values.startDate);
  const endDate = toIsoDate(values.endDate);

  return {
    _id: makeId("trip"),
    creator: creatorId,
    title: values.title.trim(),
    slug: slugify(values.title),
    description: (values.description || "").trim(),
    coverPhoto: values.coverPhoto || "",
    startDate,
    endDate,
    status: getStatusFromDates(startDate, endDate),
    isPublic: values.isPublic === "true" || values.isPublic === true,
    totalBudget: Number(values.totalBudget || 0),
    maxMembers: Number(values.maxMembers || 1),
    joinCode: makeJoinCode(values.title),
    members: [],
    createdAt: new Date().toISOString(),
  };
}

export function applyTripEdits(trip, values) {
  const startDate = toIsoDate(values.startDate) || trip.startDate;
  const endDate = toIsoDate(values.endDate) || trip.endDate;

  return {
    ...trip,
    title: values.title.trim(),
    slug: slugify(values.title),
    description: (values.description || "").trim(),
    coverPhoto: values.coverPhoto !== undefined ? values.coverPhoto : trip.coverPhoto,
    startDate,
    endDate,
    status: getStatusFromDates(startDate, endDate),
    isPublic: values.isPublic === "true" || values.isPublic === true,
    totalBudget: Number(values.totalBudget || 0),
    maxMembers: Number(values.maxMembers || trip.maxMembers),
  };
}

export function createStopRecord(values, tripId, city, stopOrder) {
  return {
    _id: makeId("stop"),
    trip: tripId,
    city: city ? city._id : values.city,
    cityName: city ? city.name : values.cityName || "",
    arrivalDate: toIsoDate(values.arrivalDate),
    departureDate: toIsoDate(values.departureDate),
    stopOrder,
    accommodation: (values.accommodation || "").trim(),
    notes: (values.notes || "").trim(),
  };
}

export function createActivityRecord(values, trip, stopId, userId) {
  const scheduledDate = toIsoDate(values.scheduledDate);

  return {
    _id: makeId("act"),
    stop: stopId,
    trip: trip._id,
    catalogActivity: values.catalogActivity || null,
    title: values.title.trim(),
    category: values.category || "Other",
    cost: Number(values.cost || 0),
    scheduledDate,
    dayNumber: getDayNumber(trip.startDate, scheduledDate),
    startTime: values.startTime || "09:00 AM",
    durationHours: Number(values.durationHours || 1),
    isCompleted: false,
    addedBy: userId,
  };
}

export function createExpenseRecord(values, trip, userId) {
  return {
    _id: makeId("exp"),
    trip: trip._id,
    title: values.title.trim(),
    amount: Number(values.amount || 0),
    category: values.category || "Other",
    date: toIsoDate(values.date) || new Date().toISOString(),
    paidBy: values.paidBy || userId,
    splitAmong:
      values.splitAmong && values.splitAmong.length > 0 ? values.splitAmong : trip.members,
  };
}
