import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import PageHeader, { SectionHeader } from "../components/ui/PageHeader";
import Button, { ButtonLink } from "../components/ui/Button";
import { TextField } from "../components/ui/Field";
import Toolbar from "../components/ui/Toolbar";
import { EmptyState } from "../components/ui/States";
import Modal from "../components/ui/Modal";
import TripCard from "../components/TripCard";
import TripForm from "../components/TripForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import { tripStatuses } from "../utils/trip";

const sortOptions = [
  { value: "startDate", label: "Sort by: start date" },
  { value: "createdAt", label: "Sort by: recently created" },
  { value: "title", label: "Sort by: name" },
  { value: "budget", label: "Sort by: budget" },
];

const groupOptions = [
  { value: "status", label: "Group by: status" },
  { value: "none", label: "Group by: nothing" },
];

const statusLabels = { ongoing: "Ongoing", upcoming: "Upcoming", completed: "Completed" };
// Ongoing first, matching the reference layout.
const categoryOrder = ["ongoing", "upcoming", "completed"];

export default function TripsPage() {
  const data = useAppData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupBy, setGroupBy] = useState("status");
  const [sortBy, setSortBy] = useState("startDate");
  const [editingTrip, setEditingTrip] = useState(null);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [joinCode, setJoinCode] = useState("");

  const user = data.currentUser;
  const allTrips = data.getMyTrips();

  const visibleTrips = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    const filtered = allTrips.filter((trip) => {
      const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
      const matchesSearch =
        search === "" ||
        trip.title.toLowerCase().includes(search) ||
        trip.description.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });

    return filtered.sort((first, second) => {
      if (sortBy === "title") return first.title.localeCompare(second.title);
      if (sortBy === "budget") return second.totalBudget - first.totalBudget;
      if (sortBy === "createdAt") return new Date(second.createdAt) - new Date(first.createdAt);
      return new Date(first.startDate) - new Date(second.startDate);
    });
  }, [allTrips, searchText, statusFilter, sortBy]);

  const statusCounts = {};
  tripStatuses.forEach((status) => {
    statusCounts[status] = allTrips.filter((trip) => trip.status === status).length;
  });

  // Ongoing / Upcoming / Completed categories, or one flat list.
  const categories = useMemo(() => {
    if (groupBy === "none") return [{ key: "all", label: "All trips", trips: visibleTrips }];
    return categoryOrder
      .map((status) => ({
        key: status,
        label: statusLabels[status],
        trips: visibleTrips.filter((trip) => trip.status === status),
      }))
      .filter((category) => category.trips.length > 0);
  }, [visibleTrips, groupBy]);

  function handleSaveEdit(values) {
    data.updateTrip(editingTrip._id, values);
    showToast(`"${values.title}" updated`);
    setEditingTrip(null);
  }

  function handleDelete() {
    const title = tripToDelete.title;
    data.deleteTrip(tripToDelete._id);
    setTripToDelete(null);
    showToast(`"${title}" deleted`, "danger");
  }

  function handleShare(trip) {
    if (trip.isPublic) {
      data.setTripVisibility(trip._id, false);
      showToast(`"${trip.title}" is private again`);
      return;
    }
    data.shareTrip(trip._id, trip.description);
    showToast(`"${trip.title}" shared to Community`);
  }

  function handleCopy(trip) {
    const copy = data.cloneTrip(trip._id);
    if (!copy) return;
    showToast(`Copied to "${copy.title}"`);
    navigate({ to: "/trips/$tripId", params: { tripId: copy._id } });
  }

  function handleJoinByCode(event) {
    event.preventDefault();
    const result = data.joinTripByCode(joinCode);
    showToast(result.message, result.ok ? "success" : "danger");
    if (result.ok) {
      setJoinCode("");
      navigate({ to: "/trips/$tripId", params: { tripId: result.trip._id } });
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="My trips"
        title="Trips"
        description="Everything you created or joined, grouped by where it is in time."
        actions={<ButtonLink to="/create-trip">Create trip</ButtonLink>}
      />

      <Toolbar
        searchId="trip-search"
        searchLabel="Search trips"
        searchPlaceholder="Search by name or description"
        searchValue={searchText}
        onSearchChange={setSearchText}
        controls={[
          {
            id: "trip-group",
            label: "Group by",
            value: groupBy,
            onChange: setGroupBy,
            options: groupOptions,
          },
          {
            id: "trip-status",
            label: "Filter",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "all", label: `Filter: all (${allTrips.length})` },
              ...tripStatuses.map((status) => ({
                value: status,
                label: `Filter: ${statusLabels[status]} (${statusCounts[status]})`,
              })),
            ],
          },
          {
            id: "trip-sort",
            label: "Sort by",
            value: sortBy,
            onChange: setSortBy,
            options: sortOptions,
          },
        ]}
      >
        <form
          onSubmit={handleJoinByCode}
          className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
        >
          <TextField
            id="join-code"
            label="Join a trip with a code"
            placeholder="HACK2026"
            hint="Trip owners share this code with their travel companions."
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value)}
          />
          <Button type="submit" variant="secondary">
            Join trip
          </Button>
        </form>
      </Toolbar>

      {visibleTrips.length > 0 ? (
        <div className="space-y-8">
          {categories.map((category) => (
            <section key={category.key}>
              <SectionHeader
                title={category.label}
                description={`${category.trips.length} ${
                  category.trips.length === 1 ? "trip" : "trips"
                }`}
              />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {category.trips.map((trip) => {
                  const isOwner = trip.creator === user._id;
                  return (
                    <TripCard
                      key={trip._id}
                      trip={trip}
                      stops={data.getStopsForTrip(trip._id)}
                      members={data.getMembersForTrip(trip)}
                      actions={
                        <>
                          <ButtonLink to="/trips/$tripId" params={{ tripId: trip._id }} size="sm">
                            View trip
                          </ButtonLink>
                          {isOwner ? (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setEditingTrip(trip)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleShare(trip)}
                              >
                                {trip.isPublic ? "Unshare" : "Share"}
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setTripToDelete(trip)}
                              >
                                Delete
                              </Button>
                            </>
                          ) : (
                            <Button variant="secondary" size="sm" onClick={() => handleCopy(trip)}>
                              Copy trip
                            </Button>
                          )}
                        </>
                      }
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title={allTrips.length === 0 ? "No trips yet" : "No trips match these filters"}
          message={
            allTrips.length === 0
              ? "Create your first trip and add the cities you want to visit."
              : "Try a different search term or clear the status filter."
          }
          action={
            allTrips.length === 0 ? (
              <ButtonLink to="/create-trip">Create trip</ButtonLink>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchText("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            )
          }
        />
      )}

      <Modal
        open={Boolean(editingTrip)}
        onClose={() => setEditingTrip(null)}
        title="Edit trip"
        description="Dates, budget and visibility stay in sync across every screen."
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingTrip(null)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-trip-form">
              Save changes
            </Button>
          </>
        }
      >
        {editingTrip ? (
          <TripForm
            id="edit-trip-form"
            cities={data.cities}
            trip={editingTrip}
            showFirstStop={false}
            onSubmit={handleSaveEdit}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(tripToDelete)}
        title="Delete this trip?"
        message={
          tripToDelete
            ? `"${tripToDelete.title}" and its stops, activities and expenses will be removed.`
            : ""
        }
        confirmLabel="Delete trip"
        onConfirm={handleDelete}
        onCancel={() => setTripToDelete(null)}
      />
    </>
  );
}
