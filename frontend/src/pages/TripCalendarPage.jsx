import PageHeader from "../components/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button, { ButtonLink } from "../components/ui/Button";
import { NotFoundState, EmptyState } from "../components/ui/States";
import TripTabs from "../components/TripTabs";
import { useToast } from "../context/ToastContext";
import { useTrip, useTripItinerary, useUpdateActivity } from "../hooks/useApi";
import { groupActivitiesByDate } from "../utils/trip";
import { formatDate, formatMoney, formatHours, formatDateRange } from "../utils/format";

export default function TripCalendarPage({ tripId }) {
  const { showToast } = useToast();
  
  const { data: trip, isLoading: tripLoading } = useTrip(tripId);
  const { data: itinerary, isLoading: itineraryLoading } = useTripItinerary(tripId);
  const updateActivity = useUpdateActivity();

  if (tripLoading || itineraryLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading calendar...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <NotFoundState
        title="Trip not found"
        message="This trip does not exist or is no longer shared with you."
        backTo="/trips"
        backLabel="Back to trips"
      />
    );
  }

  const stops = itinerary?.stops || [];
  const activities = itinerary?.activities || [];
  const days = groupActivitiesByDate(activities);

  // Find which stop covers a given date so each day shows its city.
  function findCityForDate(date) {
    const stop = stops.find((candidate) => {
      // Ensure we are comparing dates properly
      const arr = new Date(candidate.arrivalDate).toISOString().slice(0, 10);
      const dep = new Date(candidate.departureDate).toISOString().slice(0, 10);
      return date >= arr && date <= dep;
    });
    return stop ? stop.cityName : "";
  }

  return (
    <>
      <PageHeader
        eyebrow={trip.title}
        title="Calendar"
        description="Day by day view of everything scheduled on this trip."
        actions={
          <ButtonLink to="/trips/$tripId/itinerary" params={{ tripId }} variant="secondary">
            Edit itinerary
          </ButtonLink>
        }
      />

      <TripTabs tripId={tripId} />

      <p className="mb-5 text-sm text-muted-foreground">
        {formatDateRange(trip.startDate, trip.endDate)}
      </p>

      {days.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {days.map((day) => (
            <Card key={day.date}>
              <CardHeader title={formatDate(day.date)} description={findCityForDate(day.date)} />
              <CardBody className="space-y-3">
                {day.activities.map((activity) => (
                  <div key={activity._id} className="rounded-md border border-border p-3">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                      <p className="truncate text-sm font-medium">{activity.title}</p>
                      <Badge tone={activity.isCompleted ? "success" : "primary"}>
                        {activity.startTime}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {activity.category} · {formatHours(activity.durationHours)} ·{" "}
                      {formatMoney(activity.cost)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 -ml-3"
                      disabled={updateActivity.isPending}
                      onClick={() => {
                        updateActivity.mutate({
                          tripId,
                          activityId: activity._id,
                          activityData: { isCompleted: !activity.isCompleted }
                        }, {
                          onSuccess: () => showToast(activity.isCompleted ? "Marked as planned" : "Marked as done")
                        });
                      }}
                    >
                      {activity.isCompleted ? "Mark planned" : "Mark done"}
                    </Button>
                  </div>
                ))}
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nothing scheduled yet"
          message="Activities appear here once they have a date and time in the itinerary."
          action={
            <ButtonLink to="/trips/$tripId/itinerary" params={{ tripId }}>
              Add activities
            </ButtonLink>
          }
        />
      )}
    </>
  );
}
