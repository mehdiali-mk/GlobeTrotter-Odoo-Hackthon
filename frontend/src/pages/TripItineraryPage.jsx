import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button, { ButtonLink } from "../components/ui/Button";
import { NotFoundState, EmptyState } from "../components/ui/States";
import TripTabs from "../components/TripTabs";
import StopFormModal from "../components/StopFormModal";
import ActivityFormModal from "../components/ActivityFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { canEditTrip } from "../utils/permissions";
import { useToast } from "../context/ToastContext";
import { sumActivityCost } from "../utils/trip";
import {
  formatDateRange,
  formatMoney,
  formatHours,
  formatDate,
  countNights,
} from "../utils/format";
import { 
  useTripItinerary, 
  useCurrentUser, 
  useAddStop, 
  useUpdateStop, 
  useDeleteStop, 
  useAddActivity, 
  useUpdateActivity, 
  useDeleteActivity,
  useCities,
  useCatalog
} from "../hooks/useApi";

export default function TripItineraryPage({ tripId }) {
  const { showToast } = useToast();

  const [stopModal, setStopModal] = useState({ open: false, stop: null });
  const [activityModal, setActivityModal] = useState({ open: false, stop: null, activity: null });
  const [confirm, setConfirm] = useState(null);

  const { data: user } = useCurrentUser();
  const { data: itineraryData, isLoading, isError } = useTripItinerary(tripId);
  const { data: cities = [] } = useCities();
  const { data: catalog = [] } = useCatalog();

  const addStop = useAddStop();
  const updateStop = useUpdateStop();
  const deleteStop = useDeleteStop();
  
  const addActivity = useAddActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading itinerary...</div>;
  }

  if (isError || !itineraryData || !itineraryData.trip) {
    return (
      <NotFoundState
        title="Trip not found"
        message="This trip does not exist or is no longer shared with you."
        backTo="/trips"
        backLabel="Back to trips"
      />
    );
  }

  const { trip, stops = [], activities = [] } = itineraryData;
  const canEdit = canEditTrip(trip, user);

  function handleSaveStop(values) {
    if (stopModal.stop) {
      updateStop.mutate({ tripId, stopId: stopModal.stop._id, ...values }, {
        onSuccess: () => showToast("Stop updated"),
        onError: (err) => showToast(err.response?.data?.message || "Failed to update stop", "danger")
      });
    } else {
      addStop.mutate({ tripId, ...values }, {
        onSuccess: () => showToast(`Stop added to the route`),
        onError: (err) => showToast(err.response?.data?.message || "Failed to add stop", "danger")
      });
    }
    setStopModal({ open: false, stop: null });
  }

  function handleSaveActivity(values) {
    if (activityModal.activity) {
      updateActivity.mutate({ tripId, activityId: activityModal.activity._id, ...values }, {
        onSuccess: () => showToast("Activity updated"),
        onError: (err) => showToast(err.response?.data?.message || "Failed to update activity", "danger")
      });
    } else {
      addActivity.mutate({ tripId, stop: activityModal.stop._id, ...values }, {
        onSuccess: () => showToast(`"${values.title}" added to the itinerary`),
        onError: (err) => showToast(err.response?.data?.message || "Failed to add activity", "danger")
      });
    }
    setActivityModal({ open: false, stop: null, activity: null });
  }

  function handleConfirm() {
    if (confirm.kind === "stop") {
      deleteStop.mutate({ tripId, stopId: confirm.id }, {
        onSuccess: () => showToast("Stop removed", "danger"),
        onError: (err) => showToast(err.response?.data?.message || "Failed to remove stop", "danger")
      });
    } else {
      deleteActivity.mutate({ tripId, activityId: confirm.id }, {
        onSuccess: () => showToast("Activity removed", "danger"),
        onError: (err) => showToast(err.response?.data?.message || "Failed to remove activity", "danger")
      });
    }
    setConfirm(null);
  }
  
  function handleToggleActivity(activity) {
    updateActivity.mutate({ 
      tripId, 
      activityId: activity._id, 
      isCompleted: !activity.isCompleted 
    }, {
      onSuccess: () => showToast(activity.isCompleted ? "Marked as planned" : "Marked as done"),
      onError: (err) => showToast(err.response?.data?.message || "Failed to update status", "danger")
    });
  }

  // We are not implementing move stop or move activity right now
  function handleMoveStop(stop, direction) {
    showToast("Reordering is not supported yet.", "danger");
  }
  function handleMoveActivity(activity, direction) {
    showToast("Reordering is not supported yet.", "danger");
  }

  return (
    <>
      <PageHeader
        eyebrow={trip.title}
        title="Itinerary"
        description="Stops in travel order, with the activities planned inside each stop."
        actions={
          <>
            <ButtonLink to="/discover" variant="secondary">
              Find activities
            </ButtonLink>
            {canEdit ? (
              <Button onClick={() => setStopModal({ open: true, stop: null })}>Add stop</Button>
            ) : null}
          </>
        }
      >
        {!canEdit ? (
          <p className="mt-3 text-sm text-muted-foreground">
            You have view-only access to this trip. Ask the owner for editor access to make changes.
          </p>
        ) : null}
      </PageHeader>

      <TripTabs tripId={tripId} />

      {stops.length === 0 ? (
        <EmptyState
          title="No stops yet"
          message="Add the first city to start building this itinerary."
          action={
            canEdit ? (
              <Button onClick={() => setStopModal({ open: true, stop: null })}>Add stop</Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-5">
          {stops.map((stop, index) => (
            <StopSection
              key={stop._id}
              stop={stop}
              activities={activities.filter(a => a.stop === stop._id)}
              isFirst={index === 0}
              isLast={index === stops.length - 1}
              canEdit={canEdit}
              onMove={(direction) => handleMoveStop(stop, direction)}
              onEdit={() => setStopModal({ open: true, stop })}
              onRemove={() => setConfirm({ kind: "stop", id: stop._id, name: stop.cityName })}
              onAddActivity={() => setActivityModal({ open: true, stop, activity: null })}
              onEditActivity={(activity) => setActivityModal({ open: true, stop, activity })}
              onRemoveActivity={(activity) =>
                setConfirm({ kind: "activity", id: activity._id, name: activity.title })
              }
              onToggleActivity={(activity) => handleToggleActivity(activity)}
              onMoveActivity={(activity, direction) => handleMoveActivity(activity, direction)}
            />
          ))}
        </div>
      )}

      <StopFormModal
        open={stopModal.open}
        cities={cities}
        trip={trip}
        stop={stopModal.stop}
        onSave={handleSaveStop}
        onClose={() => setStopModal({ open: false, stop: null })}
      />

      {activityModal.open && (
        <ActivityFormModal
          open={activityModal.open}
          stop={activityModal.stop}
          activity={activityModal.activity}
          catalog={catalog}
          onSave={handleSaveActivity}
          onClose={() => setActivityModal({ open: false, stop: null, activity: null })}
        />
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm && confirm.kind === "stop" ? "Remove this stop?" : "Remove this activity?"}
        message={
          confirm
            ? confirm.kind === "stop"
              ? `"${confirm.name}" and every activity planned there will be removed.`
              : `"${confirm.name}" will be removed from the itinerary.`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
        loading={deleteStop.isPending || deleteActivity.isPending}
      />
    </>
  );
}

// One city stop with its scheduled activities.
function StopSection({
  stop,
  activities,
  isFirst,
  isLast,
  onMove,
  onEdit,
  onRemove,
  onAddActivity,
  onEditActivity,
  onRemoveActivity,
  onToggleActivity,
  onMoveActivity,
  canEdit,
}) {
  const activityCost = sumActivityCost(activities);

  return (
    <Card>
      <CardHeader
        title={`${stop.stopOrder}. ${stop.cityName}`}
        description={`${formatDateRange(stop.arrivalDate, stop.departureDate)} · ${countNights(
          stop.arrivalDate,
          stop.departureDate,
        )} nights`}
        action={
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <Badge tone="neutral">{formatMoney(activityCost)} in activities</Badge>
            {canEdit ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMove(-1)}
                  disabled={isFirst}
                  aria-label={`Move ${stop.cityName} earlier`}
                >
                  ↑
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMove(1)}
                  disabled={isLast}
                  aria-label={`Move ${stop.cityName} later`}
                >
                  ↓
                </Button>
                <Button variant="secondary" size="sm" onClick={onEdit}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={onRemove}>
                  Remove
                </Button>
              </>
            ) : null}
          </div>
        }
      />

      {stop.accommodation || stop.notes ? (
        <div className="border-b border-border bg-surface-muted/50 px-5 py-3 text-sm">
          {stop.accommodation ? (
            <p>
               <span className="font-semibold">Stay: </span>
              {stop.accommodation}
            </p>
          ) : null}
          {stop.notes ? <p className="mt-1 text-muted-foreground">{stop.notes}</p> : null}
        </div>
      ) : null}

      <CardBody className="px-0 py-0">
        {activities.length > 0 ? (
          <ul>
            {activities.map((activity, index) => (
              <ActivityRow
                key={activity._id}
                activity={activity}
                isFirst={index === 0}
                isLast={index === activities.length - 1}
                onEdit={() => onEditActivity(activity)}
                onRemove={() => onRemoveActivity(activity)}
                onToggle={() => onToggleActivity(activity)}
                onMove={(direction) => onMoveActivity(activity, direction)}
                canEdit={canEdit}
              />
            ))}
          </ul>
        ) : (
          <p className="px-5 py-6 text-sm text-muted-foreground">
            No activities planned in {stop.cityName} yet.
          </p>
        )}
      </CardBody>

      <div className={`border-t border-border px-5 py-3 ${canEdit ? "" : "hidden"}`}>
        <Button variant="secondary" size="sm" onClick={onAddActivity}>
          Add activity
        </Button>
      </div>
    </Card>
  );
}

function ActivityRow({ activity, isFirst, isLast, onEdit, onRemove, onToggle, onMove, canEdit }) {
  const addedBy = activity.addedBy; // Now populated by mongoose

  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 border-b border-border px-5 py-4 last:border-b-0">
      <div className="w-16 shrink-0 text-sm">
        <p className="font-medium">{activity.startTime}</p>
        <p className="text-xs text-muted-foreground">Day {activity.dayNumber}</p>
      </div>
      <div className="min-w-0">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium">{activity.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {activity.category} · {formatHours(activity.durationHours)} ·{" "}
              {formatDate(activity.scheduledDate)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-sm font-medium">{formatMoney(activity.cost)}</span>
            <Badge tone={activity.isCompleted ? "success" : "neutral"}>
              {activity.isCompleted ? "Done" : "Planned"}
            </Badge>
          </div>
        </div>

        <div className={`mt-2 flex flex-wrap items-center gap-2 ${canEdit ? "" : "hidden"}`}>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            {activity.isCompleted ? "Mark planned" : "Mark done"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMove(-1)}
            disabled={isFirst}
            aria-label={`Move ${activity.title} up`}
          >
            ↑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMove(1)}
            disabled={isLast}
            aria-label={`Move ${activity.title} down`}
          >
            ↓
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>

        {addedBy && addedBy.name ? (
          <p className="mt-1.5 text-xs text-subtle-foreground">Added by {addedBy.name}</p>
        ) : null}
      </div>
    </li>
  );
}
