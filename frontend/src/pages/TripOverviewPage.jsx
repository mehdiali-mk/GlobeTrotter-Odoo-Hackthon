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
import { useAppData } from "../context/AppDataContext";
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

export default function TripOverviewPage({ tripId }) {
  const data = useAppData();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const trip = data.getTripById(tripId);

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

  const stops = data.getStopsForTrip(tripId);
  const activities = data.getActivitiesForTrip(tripId);
  const expenses = data.getExpensesForTrip(tripId);
  const creator = data.getUserById(trip.creator);
  const user = data.currentUser;
  const role = getTripRole(trip, user._id);
  const isOwner = canManageTrip(trip, user);
  const canEdit = canEditTrip(trip, user);
  const isMember = isTripMember(trip, user._id);
  const canJoin = canJoinTrip(trip, user) && trip.isPublic;

  function handleVisibility() {
    if (trip.isPublic) {
      data.setTripVisibility(tripId, false);
      showToast("Trip is private again");
    } else {
      data.shareTrip(tripId, trip.description);
      showToast("Trip shared with the community");
    }
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
    const result = data.joinTrip(tripId);
    showToast(result.message, result.ok ? "success" : "danger");
  }

  function handleLeave() {
    const result = data.leaveTrip(tripId);
    showToast(result.message, result.ok ? "success" : "danger");
    setConfirm(null);
    if (result.ok) navigate({ to: "/trips" });
  }

  function handleDelete() {
    data.deleteTrip(tripId);
    setConfirm(null);
    showToast("Trip deleted", "danger");
    navigate({ to: "/trips" });
  }

  function handleSaveEdit(values) {
    data.updateTrip(tripId, values);
    setIsEditOpen(false);
    showToast("Trip updated");
  }

  function handleCopyTrip() {
    const copy = data.cloneTrip(tripId);
    if (!copy) return;
    showToast(`Copied to "${copy.title}"`);
    navigate({ to: "/trips/$tripId", params: { tripId: copy._id } });
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
                <Button variant="secondary" onClick={handleVisibility}>
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
            {canJoin ? <Button onClick={handleJoin}>Join trip</Button> : null}
            <Button variant="secondary" onClick={handleCopyTrip}>
              Copy trip
            </Button>
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
          <Badge tone={role ? "success" : "neutral"}>Your role: {roleLabel(role)}</Badge>
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
                <ButtonLink
                  to="/trips/$tripId/itinerary"
                  params={{ tripId }}
                  variant="ghost"
                  size="sm"
                >
                  Edit
                </ButtonLink>
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
                      <ButtonLink to="/trips/$tripId/itinerary" params={{ tripId }}>
                        Add stop
                      </ButtonLink>
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
                    action={<ButtonLink to="/discover">Browse activities</ButtonLink>}
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
                  <p className="truncate text-sm text-muted-foreground">
                    {creator.city}, {creator.country}
                  </p>
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
            <Button type="submit" form="overview-edit-trip">
              Save changes
            </Button>
          </>
        }
      >
        <TripForm
          id="overview-edit-trip"
          cities={data.cities}
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
      />
    </>
  );
}
