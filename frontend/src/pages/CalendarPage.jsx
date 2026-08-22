import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import PageHeader from "../components/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { ButtonLink } from "../components/ui/Button";
import Toolbar from "../components/ui/Toolbar";
import Calendar from "../components/Calendar";
import { useAppData } from "../context/AppDataContext";
import { formatDate, formatMoney, formatDateRange } from "../utils/format";

const groupOptions = [
  { value: "trips", label: "Group by: trips" },
  { value: "activities", label: "Group by: activities" },
];

const filterOptions = [
  { value: "all", label: "Filter: all statuses" },
  { value: "ongoing", label: "Filter: ongoing" },
  { value: "upcoming", label: "Filter: upcoming" },
  { value: "completed", label: "Filter: completed" },
];

const sortOptions = [
  { value: "date", label: "Sort by: date" },
  { value: "title", label: "Sort by: name" },
];

// Screen 11 — month calendar with the trips and activities on their dates.
export default function CalendarPage() {
  const data = useAppData();
  const navigate = useNavigate();
  const today = new Date();

  const [year, setYear] = useState(today.getUTCFullYear());
  const [month, setMonth] = useState(today.getUTCMonth());
  const [searchText, setSearchText] = useState("");
  const [groupBy, setGroupBy] = useState("trips");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const trips = data.getMyTrips();

  const events = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    const tripEvents = trips
      .filter((trip) => status === "all" || trip.status === status)
      .filter((trip) => search === "" || trip.title.toLowerCase().includes(search))
      .map((trip) => ({
        id: trip._id,
        title: trip.title,
        startDate: trip.startDate,
        endDate: trip.endDate,
        onClick: () => navigate({ to: "/trips/$tripId", params: { tripId: trip._id } }),
      }));

    if (groupBy === "trips") return tripEvents;

    const activityEvents = trips
      .filter((trip) => status === "all" || trip.status === status)
      .flatMap((trip) => data.getActivitiesForTrip(trip._id))
      .filter((activity) => search === "" || activity.title.toLowerCase().includes(search))
      .map((activity) => ({
        id: activity._id,
        title: activity.title,
        startDate: activity.scheduledDate,
        endDate: activity.scheduledDate,
        onClick: () =>
          navigate({ to: "/trips/$tripId/calendar", params: { tripId: activity.trip } }),
      }));

    return activityEvents;
  }, [trips, data, searchText, status, groupBy, navigate]);

  const listedEvents = useMemo(
    () =>
      events.slice().sort((first, second) => {
        if (sortBy === "title") return first.title.localeCompare(second.title);
        return new Date(first.startDate) - new Date(second.startDate);
      }),
    [events, sortBy],
  );

  function goPrevious() {
    if (month === 0) {
      setMonth(11);
      setYear((current) => current - 1);
      return;
    }
    setMonth((current) => current - 1);
  }

  function goNext() {
    if (month === 11) {
      setMonth(0);
      setYear((current) => current + 1);
      return;
    }
    setMonth((current) => current + 1);
  }

  function goToday() {
    setYear(today.getUTCFullYear());
    setMonth(today.getUTCMonth());
  }

  return (
    <>
      <PageHeader
        eyebrow="Calendar"
        title="Calendar view"
        description="Trips and activities placed on the dates they happen."
        actions={
          <ButtonLink to="/trips" variant="secondary">
            My trips
          </ButtonLink>
        }
      />

      <Toolbar
        searchId="calendar-search"
        searchLabel="Search the calendar"
        searchPlaceholder="Search a trip or activity"
        searchValue={searchText}
        onSearchChange={setSearchText}
        controls={[
          {
            id: "calendar-group",
            label: "Group by",
            value: groupBy,
            onChange: setGroupBy,
            options: groupOptions,
          },
          {
            id: "calendar-filter",
            label: "Filter",
            value: status,
            onChange: setStatus,
            options: filterOptions,
          },
          {
            id: "calendar-sort",
            label: "Sort by",
            value: sortBy,
            onChange: setSortBy,
            options: sortOptions,
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Calendar
          year={year}
          month={month}
          events={events}
          onPrevious={goPrevious}
          onNext={goNext}
          onToday={goToday}
        />

        <Card as="aside">
          <CardHeader
            title={groupBy === "trips" ? "Trips on the calendar" : "Scheduled activities"}
            description={`${listedEvents.length} shown`}
          />
          <CardBody className="space-y-3">
            {listedEvents.length > 0 ? (
              listedEvents.map((event) => {
                const trip = data.getTripById(event.id);
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={event.onClick}
                    className="block w-full rounded-md border border-border p-3 text-left hover:bg-surface-muted"
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                      <p className="truncate text-sm font-medium">{event.title}</p>
                      {trip ? <Badge tone="primary">{formatMoney(trip.totalBudget)}</Badge> : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.startDate === event.endDate
                        ? formatDate(event.startDate)
                        : formatDateRange(event.startDate, event.endDate)}
                    </p>
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing matches this view. Clear the search or change the filter.
              </p>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
