import { useMemo, useState } from "react";
import PageHeader, { SectionHeader } from "../components/ui/PageHeader";
import Toolbar from "../components/ui/Toolbar";
import Modal from "../components/ui/Modal";
import Button, { ButtonLink } from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import SearchResultCard from "../components/SearchResultCard";
import { EmptyState } from "../components/ui/States";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import { formatMoney, formatHours } from "../utils/format";
import { getImageUrl } from "../utils/images";

// Both cities and activities are mapped into one simple result shape so a
// single card component can render either of them.
function cityToResult(city) {
  return {
    id: city._id,
    kind: "city",
    title: city.name,
    location: `${city.country} · ${city.region}`,
    description: city.description,
    image: city.image,
    group: city.region,
    sortName: city.name,
    sortValue: city.popularity,
    details: [
      { label: "Cost index", value: city.costIndex },
      { label: "Popularity", value: `${city.popularity} / 5` },
      { label: "Top pick", value: city.isTopAttraction ? "Yes" : "No" },
    ],
    raw: city,
  };
}

function activityToResult(activity) {
  return {
    id: activity._id,
    kind: "activity",
    title: activity.title,
    location: `${activity.cityName} · ${activity.category}`,
    description: activity.description,
    image: activity.image,
    group: activity.category,
    sortName: activity.title,
    sortValue: activity.rating,
    details: [
      { label: "Cost", value: formatMoney(activity.cost) },
      { label: "Duration", value: formatHours(activity.duration) },
      { label: "Rating", value: `${activity.rating} / 5` },
    ],
    raw: activity,
  };
}

const kindOptions = [
  { value: "all", label: "Filter: cities and activities" },
  { value: "city", label: "Filter: cities only" },
  { value: "activity", label: "Filter: activities only" },
];

const groupOptions = [
  { value: "kind", label: "Group by: type" },
  { value: "group", label: "Group by: region / category" },
  { value: "none", label: "Group by: nothing" },
];

const sortOptions = [
  { value: "relevance", label: "Sort by: rating" },
  { value: "name", label: "Sort by: name" },
  { value: "cost", label: "Sort by: cost" },
];

// Screen 8 — one search screen for activities and cities.
export default function SearchPage() {
  const data = useAppData();
  const { showToast } = useToast();

  const [searchText, setSearchText] = useState("");
  const [kind, setKind] = useState("all");
  const [groupBy, setGroupBy] = useState("kind");
  const [sortBy, setSortBy] = useState("relevance");
  const [selected, setSelected] = useState(null);

  const results = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    const cityResults = data.cities.map(cityToResult);
    const activityResults = data.catalog.map(activityToResult);

    let all = [];
    if (kind === "all") all = [...activityResults, ...cityResults];
    else if (kind === "city") all = cityResults;
    else all = activityResults;

    const filtered = all.filter((result) => {
      if (search === "") return true;
      return `${result.title} ${result.location} ${result.description}`
        .toLowerCase()
        .includes(search);
    });

    return filtered.sort((first, second) => {
      if (sortBy === "name") return first.sortName.localeCompare(second.sortName);
      if (sortBy === "cost") {
        const firstCost = first.raw.cost ?? 0;
        const secondCost = second.raw.cost ?? 0;
        return firstCost - secondCost;
      }
      return second.sortValue - first.sortValue;
    });
  }, [data.cities, data.catalog, searchText, kind, sortBy]);

  const groups = useMemo(() => {
    if (groupBy === "none") return [{ key: "All results", items: results }];
    const buckets = {};
    results.forEach((result) => {
      const key =
        groupBy === "kind" ? (result.kind === "city" ? "Cities" : "Activities") : result.group;
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(result);
    });
    return Object.keys(buckets)
      .sort()
      .map((key) => ({ key, items: buckets[key] }));
  }, [results, groupBy]);

  function handleSave(result) {
    if (result.kind === "city") {
      data.toggleSavedDestination(result.id);
      showToast(
        data.isDestinationSaved(result.id)
          ? `${result.title} removed from saved`
          : `${result.title} saved`,
      );
    }
  }

  const previewImage = selected ? getImageUrl(selected.image) : null;

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title="Activity and city search"
        description="Look up a place or an experience, for example “Paragliding”, then add it to a trip."
        actions={
          <ButtonLink to="/discover" variant="secondary">
            Open Discover
          </ButtonLink>
        }
      />

      <Toolbar
        searchId="search-query"
        searchLabel="Search activities and cities"
        searchPlaceholder="Paragliding"
        searchValue={searchText}
        onSearchChange={setSearchText}
        controls={[
          {
            id: "search-group",
            label: "Group by",
            value: groupBy,
            onChange: setGroupBy,
            options: groupOptions,
          },
          {
            id: "search-filter",
            label: "Filter",
            value: kind,
            onChange: setKind,
            options: kindOptions,
          },
          {
            id: "search-sort",
            label: "Sort by",
            value: sortBy,
            onChange: setSortBy,
            options: sortOptions,
          },
        ]}
      />

      {results.length > 0 ? (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.key}>
              <SectionHeader
                title={group.key}
                description={`${group.items.length} ${group.items.length === 1 ? "result" : "results"}`}
              />
              <div className="grid gap-4 xl:grid-cols-2">
                {group.items.map((result) => (
                  <SearchResultCard
                    key={`${result.kind}-${result.id}`}
                    result={result}
                    onViewDetails={setSelected}
                    action={
                      result.kind === "city" ? (
                        <Button variant="secondary" size="sm" onClick={() => handleSave(result)}>
                          {data.isDestinationSaved(result.id) ? "Saved" : "Save"}
                        </Button>
                      ) : null
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No results found"
          message={`Nothing matches “${searchText}”. Try a shorter search or clear the filter.`}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearchText("");
                setKind("all");
              }}
            >
              Clear search
            </Button>
          }
        />
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? selected.title : ""}
        description={selected ? selected.location : ""}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
            <ButtonLink to="/create-trip">Plan a trip here</ButtonLink>
          </>
        }
      >
        {selected ? (
          <div className="space-y-4">
            {previewImage ? (
              <img
                src={previewImage}
                alt=""
                loading="lazy"
                className="h-44 w-full rounded-md object-cover"
              />
            ) : null}
            <p className="text-sm text-muted-foreground">{selected.description}</p>
            <div className="flex flex-wrap gap-2">
              {selected.details.map((detail) => (
                <Badge key={detail.label} tone="neutral">
                  {detail.label}: {detail.value}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
