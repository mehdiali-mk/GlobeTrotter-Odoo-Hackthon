import { useMemo, useState } from "react";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Button, { ButtonLink } from "../components/ui/Button";
import { SearchField, SelectField } from "../components/ui/Field";
import PageHeader, { SectionHeader } from "../components/ui/PageHeader";
import { EmptyState } from "../components/ui/States";
import CityCard from "../components/CityCard";
import TripCard from "../components/TripCard";
import { useToast } from "../context/ToastContext";
import { heroImage } from "../utils/images";
import { useCurrentUser, useCities, useMyTrips, useUpdateProfile } from "../hooks/useApi";

const groupByOptions = [
  { value: "none", label: "Group by: none" },
  { value: "region", label: "Group by: region" },
  { value: "country", label: "Group by: country" },
];

const sortByOptions = [
  { value: "popularity", label: "Sort by: popularity" },
  { value: "name", label: "Sort by: name" },
  { value: "cost", label: "Sort by: cost" },
];

// SCREEN 3 — Main landing page reached right after sign in.
export default function LandingPage() {
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [groupBy, setGroupBy] = useState("region");
  const [regionFilter, setRegionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");

  const { data: user } = useCurrentUser();
  const { data: cities = [], isLoading: isCitiesLoading } = useCities();
  const { data: myTrips = [], isLoading: isTripsLoading } = useMyTrips();
  const updateProfile = useUpdateProfile();

  const previousTrips = myTrips.filter((trip) => trip.status === "completed");
  const tripsToShow = previousTrips.length > 0 ? previousTrips : myTrips;

  const regionOptions = useMemo(() => {
    const regions = Array.from(new Set(cities.map((city) => city.region)));
    return [{ value: "all", label: "Filter: all regions" }].concat(
      regions.map((region) => ({ value: region, label: `Filter: ${region}` })),
    );
  }, [cities]);

  const visibleCities = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = cities.filter((city) => {
      const matchesRegion = regionFilter === "all" || city.region === regionFilter;
      const matchesSearch =
        !search || `${city.name} ${city.country} ${city.region}`.toLowerCase().includes(search);
      return matchesRegion && matchesSearch;
    });

    const sorted = [...filtered];
    if (sortBy === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "cost") sorted.sort((a, b) => a.costIndex.length - b.costIndex.length);
    else sorted.sort((a, b) => b.popularity - a.popularity);
    return sorted;
  }, [cities, query, regionFilter, sortBy]);

  const cityGroups = useMemo(() => {
    if (groupBy === "none") return [{ key: "All destinations", cities: visibleCities }];
    const keyOf = (city) => (groupBy === "country" ? city.country : city.region);
    const map = new Map();
    visibleCities.forEach((city) => {
      const key = keyOf(city);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(city);
    });
    return Array.from(map, ([key, citiesData]) => ({ key, cities: citiesData }));
  }, [visibleCities, groupBy]);

  const savedDestinations = user?.savedDestinations || [];
  
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
        showToast(
          isSaved
            ? `${city.name} removed from your shortlist`
            : `${city.name} added to your shortlist`,
        );
      },
      onError: () => showToast("Failed to update shortlist", "danger")
    });
  }

  if (!user) return null;

  return (
    <>
      <PageHeader
        eyebrow={`Welcome back, ${user.name.split(" ")[0]}`}
        title="Where are you going next?"
        description="Search destinations, revisit past journeys and start your next plan."
        actions={<ButtonLink to="/create-trip">+ Plan a trip</ButtonLink>}
      />

      <section className="panel mb-6 overflow-hidden">
        <div className="relative">
          <img
            src={heroImage}
            alt="Coastal city at golden hour"
            width={1600}
            height={900}
            className="h-44 w-full object-cover sm:h-60"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5">
            <p className="font-display text-xl text-white sm:text-2xl">
              Plan a multi-city journey in a single view
            </p>
          </div>
        </div>
      </section>

      <div className="mb-8 grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
        <SearchField
          id="landing-search"
          label="Search destinations"
          placeholder="Search bar ....."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <SelectField
          id="landing-group"
          label="Group by"
          options={groupByOptions}
          value={groupBy}
          onChange={(event) => setGroupBy(event.target.value)}
          className="[&>label]:sr-only"
        />
        <SelectField
          id="landing-filter"
          label="Filter"
          options={regionOptions}
          value={regionFilter}
          onChange={(event) => setRegionFilter(event.target.value)}
          className="[&>label]:sr-only"
        />
        <SelectField
          id="landing-sort"
          label="Sort by"
          options={sortByOptions}
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="[&>label]:sr-only"
        />
      </div>

      <section className="mb-10">
        <SectionHeader
          title="Top Regional Selections"
          description={isCitiesLoading ? "Loading destinations..." : `${visibleCities.length} destinations match your search`}
          action={
            <ButtonLink to="/discover" variant="secondary" size="sm">
              Open Discover
            </ButtonLink>
          }
        />

        {isCitiesLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : visibleCities.length === 0 ? (
          <EmptyState
            title="No destinations found"
            message="Try a different search term or clear the region filter."
          />
        ) : (
          <div className="space-y-6">
            {cityGroups.map((group) => (
              <div key={group.key}>
                {groupBy !== "none" ? <p className="eyebrow mb-2">{group.key}</p> : null}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {group.cities.map((city) => (
                    <CityCard
                      key={city._id}
                      city={city}
                      action={
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full justify-center"
                          onClick={() => handleSave(city)}
                          disabled={updateProfile.isPending}
                        >
                          {isDestinationSaved(city._id) ? "Shortlisted" : "Add to shortlist"}
                        </Button>
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader
          title="Previous Trips"
          description={isTripsLoading ? "Loading trips..." : "Your journeys so far"}
          action={
            <ButtonLink to="/trips" variant="secondary" size="sm">
              All trips
            </ButtonLink>
          }
        />

        {isTripsLoading ? (
           <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : tripsToShow.length === 0 ? (
          <Card>
            <CardHeader title="No trips yet" description="Your first plan starts here." />
            <CardBody>
              <ButtonLink to="/create-trip">+ Plan a trip</ButtonLink>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tripsToShow.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                members={trip.members || []}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
