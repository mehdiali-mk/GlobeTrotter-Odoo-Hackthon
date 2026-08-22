import { Link } from "@tanstack/react-router";
import PageHeader, { SectionHeader } from "../components/ui/PageHeader";
import { ButtonLink } from "../components/ui/Button";
import Card from "../components/ui/Card";
import { StatusBadge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/States";
import TripCard from "../components/TripCard";
import CityCard from "../components/CityCard";
import BudgetBar from "../components/BudgetBar";
import { useAppData } from "../context/AppDataContext";
import { getNextUpcomingTrip, sumExpenses } from "../utils/trip";
import { formatDateRange, countDays, daysUntil, formatMoney } from "../utils/format";

export default function DashboardPage() {
  const data = useAppData();
  const user = data.currentUser;
  const trips = data.getMyTrips();
  const upcomingTrip = getNextUpcomingTrip(trips);
  const recentTrips = trips
    .slice()
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
    .slice(0, 3);
  const topDestinations = data.cities.filter((city) => city.isTopAttraction).slice(0, 3);

  const firstName = user.name.split(" ")[0];
  const plannedActivities = trips.flatMap((trip) => data.getActivitiesForTrip(trip._id));
  const totalSpent = trips.reduce(
    (total, trip) => total + sumExpenses(data.getExpensesForTrip(trip._id)),
    0,
  );

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${firstName}`}
        description="Your next departure, recent plans and places worth adding to a trip."
        actions={
          <>
            <ButtonLink to="/discover" variant="secondary">
              Discover
            </ButtonLink>
            <ButtonLink to="/create-trip">Create trip</ButtonLink>
          </>
        }
      />

      <section aria-label="Your numbers" className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Trips" value={trips.length} />
        <StatCard
          label="Cities planned"
          value={trips.reduce((total, trip) => total + data.getStopsForTrip(trip._id).length, 0)}
        />
        <StatCard label="Activities" value={plannedActivities.length} />
        <StatCard label="Recorded spend" value={formatMoney(totalSpent)} />
      </section>

      <section aria-labelledby="next-trip-heading" className="mb-10">
        <SectionHeader title="Next departure" description="The soonest trip you are part of." />
        <h2 id="next-trip-heading" className="sr-only">
          Next departure
        </h2>

        {upcomingTrip ? (
          <NextTripPanel trip={upcomingTrip} />
        ) : (
          <EmptyState
            title="No upcoming trip"
            message="Create a trip to start planning stops, activities and a budget."
            action={<ButtonLink to="/create-trip">Create trip</ButtonLink>}
          />
        )}
      </section>

      <section aria-labelledby="recent-trips-heading" className="mb-10">
        <SectionHeader
          title="Recent trips"
          description="Plans you created or joined most recently."
          action={
            <ButtonLink to="/trips" variant="ghost" size="sm">
              View all
            </ButtonLink>
          }
        />
        <h2 id="recent-trips-heading" className="sr-only">
          Recent trips
        </h2>

        {recentTrips.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recentTrips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                stops={data.getStopsForTrip(trip._id)}
                members={data.getMembersForTrip(trip)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No trips yet"
            message="Your trips will appear here once you create or join one."
            action={<ButtonLink to="/create-trip">Create trip</ButtonLink>}
          />
        )}
      </section>

      <section aria-labelledby="destinations-heading">
        <SectionHeader
          title="Top destinations"
          description="Cities marked as top attractions in the catalog."
          action={
            <ButtonLink to="/discover" variant="ghost" size="sm">
              Browse all
            </ButtonLink>
          }
        />
        <h2 id="destinations-heading" className="sr-only">
          Top destinations
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {topDestinations.map((city) => (
            <CityCard key={city._id} city={city} />
          ))}
        </div>
      </section>
    </>
  );
}

function StatCard({ label, value }) {
  return (
    <Card>
      <div className="p-5">
        <p className="eyebrow">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold">{value}</p>
      </div>
    </Card>
  );
}

// Highlights the closest trip together with its stops and budget usage.
function NextTripPanel({ trip }) {
  const data = useAppData();
  const stops = data.getStopsForTrip(trip._id);
  const spent = sumExpenses(data.getExpensesForTrip(trip._id));
  const days = daysUntil(trip.startDate);

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={trip.status} />
            <span className="text-xs text-muted-foreground">
              {days > 0 ? `Departs in ${days} days` : "In progress"}
            </span>
          </div>

          <h3 className="mt-3 text-xl">
            <Link to="/trips/$tripId" params={{ tripId: trip._id }} className="hover:underline">
              {trip.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateRange(trip.startDate, trip.endDate)} ·{" "}
            {countDays(trip.startDate, trip.endDate)} days · {stops.length}{" "}
            {stops.length === 1 ? "stop" : "stops"}
          </p>

          <ol className="mt-5 space-y-3">
            {stops.map((stop) => (
              <li key={stop._id} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                  {stop.stopOrder}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{stop.cityName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateRange(stop.arrivalDate, stop.departureDate)}
                    {stop.accommodation ? ` · ${stop.accommodation}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-wrap gap-2">
            <ButtonLink to="/trips/$tripId/itinerary" params={{ tripId: trip._id }} size="sm">
              Open itinerary
            </ButtonLink>
            <ButtonLink
              to="/trips/$tripId/budget"
              params={{ tripId: trip._id }}
              size="sm"
              variant="secondary"
            >
              Budget
            </ButtonLink>
            <ButtonLink
              to="/trips/$tripId/calendar"
              params={{ tripId: trip._id }}
              size="sm"
              variant="secondary"
            >
              Calendar
            </ButtonLink>
          </div>
        </div>

        <div className="border-t border-border bg-surface-muted/60 p-5 sm:p-6 lg:border-t-0 lg:border-l">
          <p className="eyebrow mb-3">Budget</p>
          <BudgetBar totalBudget={trip.totalBudget} spent={spent} />

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Members</dt>
              <dd className="font-medium">
                {trip.members.length} of {trip.maxMembers}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Join code</dt>
              <dd className="font-medium">{trip.joinCode}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Visibility</dt>
              <dd className="font-medium">{trip.isPublic ? "Public" : "Private"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </Card>
  );
}
