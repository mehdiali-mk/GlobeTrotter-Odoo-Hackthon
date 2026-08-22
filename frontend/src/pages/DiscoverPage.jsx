import { useState } from "react";
import PageHeader, { SectionHeader } from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import { SearchField, SelectField } from "../components/ui/Field";
import Modal from "../components/ui/Modal";
import CityCard from "../components/CityCard";
import ActivityCard from "../components/ActivityCard";
import { EmptyState } from "../components/ui/States";
import { useToast } from "../context/ToastContext";
import { useCities, useCatalog, useMyTrips, useUpdateProfile, useAddStop, useAddActivity } from "../hooks/useApi";
import { tripService } from "../services/api/tripService";

function uniqueValues(arr) {
  return Array.from(new Set(arr)).filter(Boolean);
}

// Discover: browse the city catalog and the activity catalog, then push
// anything you like straight into one of your trips.
export default function DiscoverPage() {
  const { showToast } = useToast();

  const { data: cities = [], isLoading: citiesLoading } = useCities();
  const { data: activities = [], isLoading: catalogLoading } = useCatalog();
  const { data: myTrips = [] } = useMyTrips();
  
  const updateProfile = useUpdateProfile();
  const addStop = useAddStop();
  const addActivity = useAddActivity();

  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [category, setCategory] = useState("all");
  const [target, setTarget] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

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
      (activity.cityName && activity.cityName.toLowerCase().includes(search));
    return matchesCategory && matchesSearch;
  });

  // Safe check for saved destinations (assumes the user object is fetched elsewhere and accessible if needed,
  // but for simplicity we rely on checking if the API call succeeds).
  // Ideally, we'd useCurrentUser() here.
  const { data: currentUser } = require("../hooks/useApi").useCurrentUser();
  const savedDestinations = currentUser?.savedDestinations || [];
  
  function isDestinationSaved(cityId) {
    return savedDestinations.some(d => (d._id || d) === cityId);
  }

  function handleSave(city) {
    const cityId = city._id;
    const isSaved = isDestinationSaved(cityId);
    let newSavedDestinations = [];
    
    if (isSaved) {
      newSavedDestinations = savedDestinations.filter(d => (d._id || d) !== cityId);
    } else {
      newSavedDestinations = [...savedDestinations, cityId];
    }
    
    updateProfile.mutate({ savedDestinations: newSavedDestinations }, {
      onSuccess: () => {
        showToast(isSaved ? `${city.name} removed from saved` : `${city.name} saved to your profile`);
      },
      onError: () => showToast("Failed to update saved destinations", "danger")
    });
  }

  // Adds the chosen city or activity to the selected trip.
  async function handleAddToTrip(tripId) {
    const trip = myTrips.find(t => t._id === tripId);
    if (!trip || !target) return;
    
    setIsAdding(true);

    try {
      if (target.kind === "city") {
        await addStop.mutateAsync({
          tripId,
          city: target.item._id,
          arrivalDate: trip.startDate,
          departureDate: trip.endDate,
          accommodation: "",
          notes: "",
        });
        showToast(`${target.item.name} added to "${trip.title}"`);
      } else {
        // Adding an activity. We need to find if there's a stop in this trip for the activity's city.
        const itinerary = await tripService.getTripItinerary(tripId);
        const stops = itinerary.data?.stops || [];
        
        // Match by city ID. target.item is an ActivityCatalog item, which has a `city` field.
        const cityId = typeof target.item.city === 'object' ? target.item.city._id : target.item.city;
        const matchingStop = stops.find(s => {
          const sCityId = typeof s.city === 'object' ? s.city._id : s.city;
          return sCityId === cityId;
        });

        if (!matchingStop) {
          showToast("Add a stop for that city to the trip first", "danger");
        } else {
          await addActivity.mutateAsync({
            tripId,
            stop: matchingStop._id,
            catalogActivity: target.item._id,
            title: target.item.title,
            category: target.item.category,
            cost: target.item.estimatedCost,
            scheduledDate: matchingStop.arrivalDate,
            dayNumber: 1,
            startTime: "10:00 AM",
            durationHours: target.item.durationHours || 2
          });
          showToast(`"${target.item.title}" added to "${trip.title}"`);
        }
      }
      setTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add to trip", "danger");
    } finally {
      setIsAdding(false);
    }
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
          description={citiesLoading ? "Loading..." : `${visibleCities.length} cities in the catalog`}
        />
        {citiesLoading ? (
           <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : visibleCities.length > 0 ? (
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
                      variant={isDestinationSaved(city._id) ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => handleSave(city)}
                      disabled={updateProfile.isPending}
                    >
                      {isDestinationSaved(city._id) ? "Saved" : "Save"}
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
          description={catalogLoading ? "Loading..." : `${visibleActivities.length} activities available`}
        />
        {catalogLoading ? (
           <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : visibleActivities.length > 0 ? (
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
        onClose={() => !isAdding && setTarget(null)}
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
                  disabled={isAdding}
                  className="flex w-full items-center justify-between gap-3 rounded-md border border-border px-4 py-3 text-left text-sm hover:bg-surface-muted disabled:opacity-50"
                >
                  <span className="min-w-0 truncate font-medium">{trip.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    Select
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
