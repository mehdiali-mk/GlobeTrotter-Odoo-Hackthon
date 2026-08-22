import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import PageHeader from "../components/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Badge, { StatusBadge } from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";
import Button, { ButtonLink } from "../components/ui/Button";
import { NotFoundState, EmptyState } from "../components/ui/States";
import TripTabs from "../components/TripTabs";
import BudgetBar from "../components/BudgetBar";
import MemberList from "../components/MemberList";
import Modal from "../components/ui/Modal";
import TripForm from "../components/TripForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import { sumExpenses } from "../utils/trip";
import { formatDateRange, countDays, countNights } from "../utils/format";
import {
  canManageTrip,
  canEditTrip,
  canJoinTrip,
  getTripRole,
  isTripMember,
  roleLabel,
} from "../utils/permissions";
import { 
  useTripItinerary, 
  useCurrentUser, 
  useUpdateTrip, 
  useDeleteTrip, 
  useJoinTrip, 
  useLeaveTrip 
} from "../hooks/useApi";
import { tripService } from "../services/api/tripService";

export default function TripOverviewPage({ tripId }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Queries & Mutations
  const { data: user } = useCurrentUser();
  const { data: itineraryData, isLoading, isError } = useTripItinerary(tripId);
  
  const updateTrip = useUpdateTrip();
  const deleteTrip = useDeleteTrip();
  const joinTrip = useJoinTrip();
  const leaveTrip = useLeaveTrip();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading trip...</div>;
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

  const { trip, stops = [], activities = [], expenses = [] } = itineraryData;
  const creator = trip.creator;
  const role = getTripRole(trip, user?._id);
  const isOwner = canManageTrip(trip, user);
  const canEdit = canEditTrip(trip, user);
  const isMember = isTripMember(trip, user?._id);
  const canJoin = canJoinTrip(trip, user) && trip.isPublic;

  function handleVisibility() {
    updateTrip.mutate({ id: tripId, isPublic: !trip.isPublic }, {
      onSuccess: () => {
        showToast(trip.isPublic ? "Trip is private again" : "Trip shared with the community");
      },
      onError: (err) => showToast(err.response?.data?.message || "Failed to update", "danger")
    });
  }

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(trip.joinCode);
      setCopiedCode(true);
      showToast("Join code copied");
    } catch {
      showToast("Could not copy the join code", "danger");
    }
  }

  function handleJoin() {
    joinTrip.mutate(trip.joinCode, {
      onSuccess: () => showToast("Successfully joined the trip!", "success"),
      onError: (err) => showToast(err.response?.data?.message || "Failed to join", "danger")
    });
  }

  function handleLeave() {
    if (!user) return;
    leaveTrip.mutate({ tripId, userId: user._id }, {
      onSuccess: () => {
        showToast("You have left the trip", "success");
        setConfirm(null);
        navigate({ to: "/trips" });
      },
      onError: (err) => {
        showToast(err.response?.data?.message || "Failed to leave", "danger");
        setConfirm(null);
      }
    });
  }

  function handleDelete() {
    deleteTrip.mutate(tripId, {
      onSuccess: () => {
        setConfirm(null);
        showToast("Trip deleted", "danger");
        navigate({ to: "/trips" });
      },
      onError: (err) => {
        showToast(err.response?.data?.message || "Failed to delete", "danger");
        setConfirm(null);
      }
    });
  }

  function handleSaveEdit(values) {
    updateTrip.mutate({ id: tripId, ...values }, {
      onSuccess: () => {
        setIsEditOpen(false);
        showToast("Trip updated");
      },
      onError: (err) => showToast(err.response?.data?.message || "Failed to update", "danger")
    });
  }

  async function handleCopyTrip() {
    try {
      const response = await tripService.cloneTrip(trip.slug);
      showToast(`Copied to "${response.data.trip.title}"`);
      navigate({ to: "/trips/$tripId", params: { tripId: response.data.trip._id } });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to clone trip", "danger");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Trip"
        title={trip.title}
        description={trip.description}
        actions={
          <>
            <ButtonLink to="/trips" variant="secondary">
              All trips
            </ButtonLink>
            {isOwner ? (
              <>
                <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
                  Edit trip
                </Button>
                <Button variant="secondary" onClick={handleVisibility} loading={updateTrip.isPending}>
                  {trip.isPublic ? "Make private" : "Share publicly"}
                </Button>
                <Button
                  variant="danger"
                  onClick={() =>
                    setConfirm({
                      kind: "delete",
                      title: "Delete this trip?",
                      message: `"${trip.title}", its stops, activities and expenses will be removed.`,
                      confirmLabel: "Delete trip",
                    })
                  }
                >
                  Delete
                </Button>
              </>
            ) : null}
            {isMember && !isOwner ? (
              <Button
                variant="secondary"
                onClick={() =>
                  setConfirm({
                    kind: "leave",
                    title: "Leave this trip?",
                    message: "You will lose access to the itinerary and budget.",
                    confirmLabel: "Leave trip",
                  })
                }
              >
                Leave trip
              </Button>
            ) : null}
            {canJoin ? <Button onClick={handleJoin} loading={joinTrip.isPending}>Join trip</Button> : null}
            {trip.isPublic && !isMember && (
              <Button variant="secondary" onClick={handleCopyTrip}>
                Copy trip
              </Button>
            )}
            {canEdit ? (
              <ButtonLink to="/trips/$tripId/itinerary" params={{ tripId }}>
                Build itinerary
              </ButtonLink>
            ) : (
              <ButtonLink to="/trips/$tripId/itinerary" params={{ tripId }} variant="secondary">
                Open itinerary
              </ButtonLink>
            )}
          </>
        }
      >
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusBadge status={trip.status} />
          <Badge tone={trip.isPublic ? "primary" : "neutral"}>
            {trip.isPublic ? "Public plan" : "Private plan"}
          </Badge>
          {role && <Badge tone="success">Your role: {roleLabel(role)}</Badge>}
          <span className="text-sm text-muted-foreground">
            {formatDateRange(trip.startDate, trip.endDate)} ·{" "}
            {countDays(trip.startDate, trip.endDate)} days
          </span>
        </div>
      </PageHeader>

      <TripTabs tripId={tripId} />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Stops"
              description={`${stops.length} cities on this route`}
              action={
                canEdit && (
                  <ButtonLink
                    to="/trips/$tripId/itinerary"
                    params={{ tripId }}
                    variant="ghost"
                    size="sm"
                  >
                    Edit
                  </ButtonLink>
                )
              }
            />
            <CardBody className="px-0 py-0">
              {stops.length > 0 ? (
                <ul>
                  {stops.map((stop) => (
                    <li
                      key={stop._id}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 border-b border-border px-5 py-4 last:border-b-0"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                        {stop.stopOrder}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium">{stop.cityName}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {formatDateRange(stop.arrivalDate, stop.departureDate)}
                        </p>
                        {stop.accommodation ? (
                          <p className="mt-1 text-sm">{stop.accommodation}</p>
                        ) : null}
                        {stop.notes ? (
                          <p className="mt-1 text-sm text-subtle-foreground">{stop.notes}</p>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {countNights(stop.arrivalDate, stop.departureDate)} nights
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-5">
                  <EmptyState
                    title="No stops yet"
                    message="Add the cities you plan to visit to build the route."
                    action={
                      canEdit && (
                        <ButtonLink to="/trips/$tripId/itinerary" params={{ tripId }}>
                          Add stop
                        </ButtonLink>
                      )
                    }
                  />
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Planned activities"
              description={`${activities.length} activities scheduled`}
            />
            <CardBody className="px-0 py-0">
              {activities.length > 0 ? (
                <ul>
                  {activities.slice(0, 5).map((activity) => (
                    <li
                      key={activity._id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-3.5 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{activity.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Day {activity.dayNumber} · {activity.startTime} · {activity.category}
                        </p>
                      </div>
                      <Badge tone={activity.isCompleted ? "success" : "neutral"}>
                        {activity.isCompleted ? "Done" : "Planned"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-5">
                  <EmptyState
                    title="No activities yet"
                    message="Add activities from Discover to fill the itinerary."
                    action={canEdit && <ButtonLink to="/discover">Browse activities</ButtonLink>}
                  />
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Budget" description="Based on recorded expenses" />
            <CardBody>
              <BudgetBar totalBudget={trip.totalBudget} spent={sumExpenses(expenses)} />
              <ButtonLink
                to="/trips/$tripId/budget"
                params={{ tripId }}
                variant="secondary"
                size="sm"
                className="mt-4 w-full"
              >
                View breakdown
              </ButtonLink>
            </CardBody>
          </Card>

          <MemberList trip={trip} />

          <Card>
            <CardHeader title="Join code" description="Share it so people can join this trip." />
            <CardBody>
              <div className="flex items-center justify-between gap-3 rounded-md bg-surface-muted px-3 py-2.5">
                <p className="text-sm font-medium tracking-wide">{trip.joinCode}</p>
                <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                  {copiedCode ? "Copied" : "Copy"}
                </Button>
              </div>
            </CardBody>
          </Card>

          {creator ? (
            <Card>
              <CardHeader title="Created by" />
              <CardBody className="flex items-center gap-3">
                <Avatar name={creator.name} photo={creator.photo} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{creator.name}</p>
                </div>
              </CardBody>
            </Card>
          ) : null}
        </div>
      </div>

      <Modal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit trip"
        description="Changes apply everywhere this trip appears."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="overview-edit-trip" loading={updateTrip.isPending}>
              Save changes
            </Button>
          </>
        }
      >
        <TripForm
          id="overview-edit-trip"
          cities={[]} // We don't have all cities here, but Edit doesn't need them as much if it's just title/dates
          trip={trip}
          showFirstStop={false}
          onSubmit={handleSaveEdit}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm ? confirm.title : ""}
        message={confirm ? confirm.message : ""}
        confirmLabel={confirm ? confirm.confirmLabel : "Confirm"}
        onConfirm={confirm && confirm.kind === "leave" ? handleLeave : handleDelete}
        onCancel={() => setConfirm(null)}
        loading={deleteTrip.isPending || leaveTrip.isPending}
      />
    </>
  );
}
