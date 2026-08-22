import { useMemo, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import { ButtonLink } from "../components/ui/Button";
import Toolbar from "../components/ui/Toolbar";
import ItineraryDay from "../components/ItineraryDay";
import BudgetBar from "../components/BudgetBar";
import { EmptyState } from "../components/ui/States";
import { useAppData } from "../context/AppDataContext";
import { formatMoney, parseTimeToMinutes, formatDateRange } from "../utils/format";
import { sumExpenses } from "../utils/trip";
import { getDayNumber } from "../services/tripService";

const groupOptions = [
  { value: "day", label: "Group by: day" },
  { value: "category", label: "Group by: category" },
];

const sortOptions = [
  { value: "time", label: "Sort by: start time" },
  { value: "cost", label: "Sort by: expense" },
  { value: "title", label: "Sort by: name" },
];

// Screen 9 — day by day itinerary of a selected place with its expenses.
export default function ItineraryViewPage() {
  const data = useAppData();
  const trips = data.getMyTrips();

  const [tripId, setTripId] = useState(trips[0] ? trips[0]._id : "");
  const [searchText, setSearchText] = useState("");
  const [groupBy, setGroupBy] = useState("day");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("time");

  const trip = trips.find((item) => item._id === tripId) || null;
  const stops = trip ? data.getStopsForTrip(trip._id) : [];
  const allActivities = trip ? data.getActivitiesForTrip(trip._id) : [];
  const tripExpenses = trip ? data.getExpensesForTrip(trip._id) : [];

  const categories = Array.from(new Set(allActivities.map((activity) => activity.category)));

  const visibleActivities = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    const filtered = allActivities.filter((activity) => {
      const matchesCategory = category === "all" || activity.category === category;
      const matchesSearch = search === "" || activity.title.toLowerCase().includes(search);
      return matchesCategory && matchesSearch;
    });

    return filtered.slice().sort((first, second) => {
      if (sortBy === "cost") return Number(second.cost) - Number(first.cost);
      if (sortBy === "title") return first.title.localeCompare(second.title);
      return parseTimeToMinutes(first.startTime) - parseTimeToMinutes(second.startTime);
    });
  }, [allActivities, searchText, category, sortBy]);

  // Groups either by calendar day or by activity category.
  const groups = useMemo(() => {
    const buckets = {};
    visibleActivities.forEach((activity) => {
      const key =
        groupBy === "category" ? activity.category : String(activity.scheduledDate).slice(0, 10);
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(activity);
    });

    return Object.keys(buckets)
      .sort()
      .map((key) => ({ key, activities: buckets[key] }));
  }, [visibleActivities, groupBy]);

  const activityCost = allActivities.reduce(
    (total, activity) => total + Number(activity.cost || 0),
    0,
  );
  const recordedSpend = sumExpenses(tripExpenses);
  const totalExpenses = activityCost + recordedSpend;
  const totalBudget = trip ? trip.totalBudget : 0;
  const remaining = totalBudget - totalExpenses;

  return (
    <>
      <PageHeader
        eyebrow="Itinerary"
        title="Itinerary for a selected place"
        description="Every day of the trip with its activities and what each one costs."
        actions={
          <>
            <ButtonLink to="/itinerary" variant="secondary">
              Build itinerary
            </ButtonLink>
            {trip ? (
              <ButtonLink to="/trips/$tripId/itinerary" params={{ tripId: trip._id }}>
                Edit itinerary
              </ButtonLink>
            ) : null}
          </>
        }
      />

      <Toolbar
        searchId="itinerary-view-search"
        searchLabel="Search activities"
        searchPlaceholder="Search an activity"
        searchValue={searchText}
        onSearchChange={setSearchText}
        controls={[
          {
            id: "iv-group",
            label: "Group by",
            value: groupBy,
            onChange: setGroupBy,
            options: groupOptions,
          },
          {
            id: "iv-filter",
            label: "Filter",
            value: category,
            onChange: setCategory,
            options: [
              { value: "all", label: "Filter: all categories" },
              ...categories.map((item) => ({ value: item, label: `Filter: ${item}` })),
            ],
          },
          {
            id: "iv-sort",
            label: "Sort by",
            value: sortBy,
            onChange: setSortBy,
            options: sortOptions,
          },
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <label htmlFor="iv-trip" className="text-sm font-medium">
            Selected place
            <select
              id="iv-trip"
              value={tripId}
              onChange={(event) => setTripId(event.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-ring/30 focus:outline-none"
            >
              {trips.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          {trip ? (
            <p className="text-sm text-muted-foreground">
              {stops.map((stop) => stop.cityName).join(" → ") || "No stops yet"} ·{" "}
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
          ) : null}
        </div>
      </Toolbar>

      {!trip ? (
        <EmptyState
          title="No trips yet"
          message="Create a trip to see its day by day itinerary here."
          action={<ButtonLink to="/create-trip">Create trip</ButtonLink>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4">
            {groups.length > 0 ? (
              groups.map((group, index) => (
                <ItineraryDay
                  key={group.key}
                  dayNumber={
                    groupBy === "day"
                      ? getDayNumber(trip.startDate, group.activities[0].scheduledDate)
                      : index + 1
                  }
                  date={groupBy === "day" ? group.activities[0].scheduledDate : null}
                  activities={group.activities}
                />
              ))
            ) : (
              <EmptyState
                title="Nothing planned yet"
                message="Add activities to this trip and they will appear grouped by day."
                action={
                  <ButtonLink to="/trips/$tripId/itinerary" params={{ tripId: trip._id }}>
                    Add activities
                  </ButtonLink>
                }
              />
            )}
          </div>

          <Card as="aside">
            <CardHeader title="Budget" description="Calculated from activities and expenses." />
            <CardBody className="space-y-4">
              <BudgetBar spent={totalExpenses} totalBudget={totalBudget} />
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="eyebrow">Total budget</dt>
                  <dd className="mt-1 text-lg font-semibold">{formatMoney(totalBudget)}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Total expenses</dt>
                  <dd className="mt-1 text-lg font-semibold">{formatMoney(totalExpenses)}</dd>
                </div>
                <div className="col-span-2 border-t border-border pt-4">
                  <dt className="eyebrow">Remaining budget</dt>
                  <dd
                    className={`mt-1 text-lg font-semibold ${
                      remaining < 0 ? "text-danger" : "text-success"
                    }`}
                  >
                    {formatMoney(remaining)}
                  </dd>
                </div>
              </dl>
              <div className="border-t border-border pt-4 text-sm text-muted-foreground">
                <p>Planned activities: {formatMoney(activityCost)}</p>
                <p className="mt-1">Recorded expenses: {formatMoney(recordedSpend)}</p>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
}
