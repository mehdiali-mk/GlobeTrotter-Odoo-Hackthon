import { useState } from "react";
import PageHeader, { SectionHeader } from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import { SearchField, SelectField } from "../components/ui/Field";
import Modal from "../components/ui/Modal";
import CityCard from "../components/CityCard";
import ActivityCard from "../components/ActivityCard";
import { EmptyState } from "../components/ui/States";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import { uniqueValues } from "../services/tripService";

// Discover: browse the city catalog and the activity catalog, then push
// anything you like straight into one of your trips.
export default function DiscoverPage() {
  const data = useAppData();
  const { showToast } = useToast();

  const cities = data.cities;
  const activities = data.catalog;
  const myTrips = data.getMyTrips();

  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [category, setCategory] = useState("all");
  const [target, setTarget] = useState(null);

  const regionOptions = [
    { value: "all", label: "All regions" },
    ...uniqueValues(cities.map((city) => city.region)).map((value) => ({ value, label: value })),
  ];

  const categoryOptions = [
    { value: "all", label: "All categories" },
    ...uniqueValues(activities.map((activity) => activity.category)).map((value) => ({
      value,
      label: value,
    })),
  ];

  const search = query.trim().toLowerCase();

  const visibleCities = cities.filter((city) => {
    const matchesRegion = region === "all" || city.region === region;
    const matchesSearch =
      search === "" ||
      city.name.toLowerCase().includes(search) ||
      city.country.toLowerCase().includes(search);
    return matchesRegion && matchesSearch;
  });

  const visibleActivities = activities.filter((activity) => {
    const matchesCategory = category === "all" || activity.category === category;
    const matchesSearch =
      search === "" ||
      activity.title.toLowerCase().includes(search) ||
      activity.cityName.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });

  function handleSave(city) {
    const isSaved = data.toggleSavedDestination(city._id);
    showToast(isSaved ? `${city.name} saved to your profile` : `${city.name} removed from saved`);
  }

  // Adds the chosen city or activity to the selected trip.
  function handleAddToTrip(tripId) {
    const trip = data.getTripById(tripId);
    if (!trip || !target) return;

    if (target.kind === "city") {
      const stop = data.addStop(tripId, {
        city: target.item._id,
        arrivalDate: trip.startDate,
        departureDate: trip.endDate,
        accommodation: "",
        notes: "",
      });
      showToast(`${stop.cityName} added to "${trip.title}"`);
    } else {
      const added = data.addCatalogActivityToTrip(tripId, target.item._id);
      if (!added) {
        showToast("Add a stop to that trip first", "danger");
      } else {
        showToast(`"${added.title}" added to "${trip.title}"`);
      }
    }
    setTarget(null);
  }

  return (
    <>
      <PageHeader
        eyebrow="Discover"
        title="Cities and activities"
        description="Browse destinations and things to do, then add them to a trip itinerary."
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_180px]">
        <SearchField
          id="discover-search"
          label="Search cities and activities"
          placeholder="Search cities or activities"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <SelectField
          id="discover-region"
          label="Region"
          options={regionOptions}
          value={region}
          onChange={(event) => setRegion(event.target.value)}
        />
        <SelectField
          id="discover-category"
          label="Activity category"
          options={categoryOptions}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        />
      </div>

      <section className="mb-10">
        <SectionHeader
          title="Destinations"
          description={`${visibleCities.length} cities in the catalog`}
        />
        {visibleCities.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleCities.map((city) => (
              <CityCard
                key={city._id}
                city={city}
                action={
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => setTarget({ kind: "city", item: city })}>
                      Add to trip
                    </Button>
                    <Button
                      variant={data.isDestinationSaved(city._id) ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => handleSave(city)}
                    >
                      {data.isDestinationSaved(city._id) ? "Saved" : "Save"}
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No cities match your search"
            message="Try a different name or clear the region filter."
          />
        )}
      </section>

      <section>
        <SectionHeader
          title="Things to do"
          description={`${visibleActivities.length} activities available`}
        />
        {visibleActivities.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {visibleActivities.map((activity) => (
              <ActivityCard
                key={activity._id}
                activity={activity}
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setTarget({ kind: "activity", item: activity })}
                  >
                    Add to itinerary
                  </Button>
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No activities match your filters"
            message="Change the category or search for another city."
          />
        )}
      </section>

      <Modal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title={target ? `Add "${target.item.title || target.item.name}" to a trip` : ""}
        description="Choose which of your trips this should go into."
      >
        {myTrips.length > 0 ? (
          <ul className="space-y-2">
            {myTrips.map((trip) => (
              <li key={trip._id}>
                <button
                  type="button"
                  onClick={() => handleAddToTrip(trip._id)}
                  className="flex w-full items-center justify-between gap-3 rounded-md border border-border px-4 py-3 text-left text-sm hover:bg-surface-muted"
                >
                  <span className="min-w-0 truncate font-medium">{trip.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {data.getStopsForTrip(trip._id).length} stops
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            You have no trips yet. Create one first, then add destinations to it.
          </p>
        )}
      </Modal>
    </>
  );
}
