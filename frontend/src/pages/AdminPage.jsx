import { useMemo, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Badge, { StatusBadge } from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";
import Button, { ButtonLink } from "../components/ui/Button";
import { TextField, SelectField } from "../components/ui/Field";
import Toolbar from "../components/ui/Toolbar";
import Modal from "../components/ui/Modal";
import AdminStats from "../components/AdminStats";
import ChartCard from "../components/ChartCard";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import { ErrorState } from "../components/ui/States";
import { useAppData } from "../context/AppDataContext";
import { sumExpenses } from "../utils/trip";
import { formatMoney, formatDate } from "../utils/format";

const regionOptions = ["Europe", "Asia", "Americas", "Africa", "Oceania"].map((region) => ({
  value: region,
  label: region,
}));

const tabs = [
  { key: "users", label: "Manage Users" },
  { key: "cities", label: "Popular Cities" },
  { key: "activities", label: "Popular Activities" },
  { key: "analytics", label: "User Trends and Analytics" },
];

const groupOptions = [
  { value: "none", label: "Group by: nothing" },
  { value: "role", label: "Group by: role" },
  { value: "country", label: "Group by: country" },
];

const filterOptions = [
  { value: "all", label: "Filter: everyone" },
  { value: "admin", label: "Filter: admins" },
  { value: "user", label: "Filter: travellers" },
  { value: "active", label: "Filter: active users" },
];

const sortOptions = [
  { value: "name", label: "Sort by: name" },
  { value: "trips", label: "Sort by: trips" },
  { value: "joined", label: "Sort by: joined" },
];

// Screen 12 — admin panel: user management, popular catalog data and analytics.
export default function AdminPage() {
  const data = useAppData();
  const { showToast } = useToast();
  const [tab, setTab] = useState("users");
  const [searchText, setSearchText] = useState("");
  const [groupBy, setGroupBy] = useState("none");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [cityForm, setCityForm] = useState({ name: "", country: "", region: "Europe" });
  const [confirm, setConfirm] = useState(null);
  const [viewedUser, setViewedUser] = useState(null);
  const user = data.currentUser;

  const users = data.users;
  const cities = data.cities;
  const activities = data.catalog;
  const trips = data.trips;
  const posts = data.posts;

  // Trip counts per user drive both the table and the analytics tab.
  const tripCountByUser = useMemo(() => {
    const counts = {};
    users.forEach((person) => {
      counts[person._id] = trips.filter(
        (trip) =>
          trip.creator === person._id ||
          (trip.members || []).some((member) => member.user === person._id),
      ).length;
    });
    return counts;
  }, [users, trips]);

  const visibleUsers = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    const filtered = users.filter((person) => {
      const matchesSearch =
        search === "" ||
        `${person.name} ${person.email} ${person.city} ${person.country}`
          .toLowerCase()
          .includes(search);
      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "active" && tripCountByUser[person._id] > 0) ||
        person.role === filterBy;
      return matchesSearch && matchesFilter;
    });

    return filtered.slice().sort((first, second) => {
      if (sortBy === "trips") return tripCountByUser[second._id] - tripCountByUser[first._id];
      if (sortBy === "joined") return new Date(second.createdAt) - new Date(first.createdAt);
      return first.name.localeCompare(second.name);
    });
  }, [users, searchText, filterBy, sortBy, tripCountByUser]);

  const userGroups = useMemo(() => {
    if (groupBy === "none") return [{ key: "All users", users: visibleUsers }];
    const buckets = {};
    visibleUsers.forEach((person) => {
      const key = groupBy === "role" ? person.role : person.country || "Unknown";
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(person);
    });
    return Object.keys(buckets)
      .sort()
      .map((key) => ({ key, users: buckets[key] }));
  }, [visibleUsers, groupBy]);

  if (!user || user.role !== "admin") {
    return (
      <ErrorState
        title="Admin access required"
        message="This area is only available to administrators."
        action={
          <ButtonLink to="/dashboard" variant="secondary">
            Back to dashboard
          </ButtonLink>
        }
      />
    );
  }

  const totalSpent = trips.reduce(
    (total, trip) => total + sumExpenses(data.getExpensesForTrip(trip._id)),
    0,
  );
  const totalBudget = trips.reduce((total, trip) => total + trip.totalBudget, 0);
  const activeUsers = users.filter((person) => tripCountByUser[person._id] > 0).length;
  const completedTrips = trips.filter(
    (trip) => data.getTripById(trip._id)?.status === "completed",
  ).length;

  // How often each city and activity is actually used in trips.
  const cityUsage = cities.map((city) => {
    const stopTrips = new Set(
      trips.flatMap((trip) =>
        data
          .getStopsForTrip(trip._id)
          .filter((stop) => stop.city === city._id)
          .map(() => trip._id),
      ),
    );
    return { city, trips: stopTrips.size };
  });

  const activityUsage = activities.map((activity) => {
    const used = trips.flatMap((trip) =>
      data.getActivitiesForTrip(trip._id).filter((item) => item.catalogActivity === activity._id),
    );
    return { activity, uses: used.length };
  });

  const popularCity = cityUsage
    .slice()
    .sort(
      (first, second) =>
        second.trips - first.trips || second.city.popularity - first.city.popularity,
    )[0];
  const popularActivity = activityUsage
    .slice()
    .sort(
      (first, second) => second.uses - first.uses || second.activity.rating - first.activity.rating,
    )[0];

  const stats = [
    { label: "Total users", value: users.length, hint: `${activeUsers} with at least one trip` },
    { label: "Total trips", value: trips.length, hint: `${posts.length} shared publicly` },
    { label: "Active users", value: activeUsers },
    { label: "Completed trips", value: completedTrips },
    {
      label: "Popular destination",
      value: popularCity ? popularCity.city.name : "—",
      hint: popularCity ? `${popularCity.trips} trips planned` : undefined,
    },
    {
      label: "Popular activity",
      value: popularActivity ? popularActivity.activity.title : "—",
      hint: popularActivity ? `${popularActivity.uses} times added` : undefined,
    },
    { label: "Total budget", value: formatMoney(totalBudget) },
    { label: "Recorded spend", value: formatMoney(totalSpent) },
    { label: "Cities in catalog", value: cities.length, hint: `${activities.length} activities` },
  ];

  function handleAddCity(event) {
    event.preventDefault();
    if (!cityForm.name.trim()) {
      showToast("Enter a city name", "danger");
      return;
    }
    data.addCity(cityForm);
    showToast(`${cityForm.name} added to the catalog`);
    setCityForm({ name: "", country: "", region: "Europe" });
  }

  function handleConfirm() {
    if (confirm.kind === "city") data.removeCity(confirm.id);
    if (confirm.kind === "post") data.removePost(confirm.id);
    if (confirm.kind === "activity") data.removeCatalogActivity(confirm.id);
    setConfirm(null);
    showToast("Removed", "danger");
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Admin panel"
        description="Manage users, the destination catalog and platform analytics."
      />

      <Toolbar
        searchId="admin-search"
        searchLabel="Search the platform"
        searchPlaceholder="Search users, cities or activities"
        searchValue={searchText}
        onSearchChange={setSearchText}
        controls={[
          {
            id: "admin-group",
            label: "Group by",
            value: groupBy,
            onChange: setGroupBy,
            options: groupOptions,
          },
          {
            id: "admin-filter",
            label: "Filter",
            value: filterBy,
            onChange: setFilterBy,
            options: filterOptions,
          },
          {
            id: "admin-sort",
            label: "Sort by",
            value: sortBy,
            onChange: setSortBy,
            options: sortOptions,
          },
        ]}
      >
        <nav aria-label="Admin sections" className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <Button
              key={item.key}
              variant={tab === item.key ? "primary" : "secondary"}
              size="sm"
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </Button>
          ))}
        </nav>
      </Toolbar>

      <div className="mb-8">
        <AdminStats stats={stats.slice(0, 6)} />
      </div>

      {tab === "users" ? (
        <div className="space-y-6">
          {userGroups.map((group) => (
            <Card key={group.key}>
              <CardHeader
                title={group.key}
                description={`${group.users.length} ${group.users.length === 1 ? "account" : "accounts"}`}
              />
              <CardBody className="px-0 py-0">
                <ul>
                  {group.users.map((person) => (
                    <li
                      key={person._id}
                      className="grid gap-3 border-b border-border px-5 py-4 last:border-b-0 md:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1fr)_auto_auto] md:items-center"
                    >
                      <Avatar name={person.name} photo={person.photo} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{person.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{person.email}</p>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {person.city}, {person.country}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge tone="neutral">{tripCountByUser[person._id]} trips</Badge>
                        <Badge tone={tripCountByUser[person._id] > 0 ? "success" : "warning"}>
                          {tripCountByUser[person._id] > 0 ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setViewedUser(person)}>
                          View
                        </Button>
                        {person._id === user._id ? (
                          <Badge tone="primary">you · {person.role}</Badge>
                        ) : (
                          <select
                            aria-label={`Platform role for ${person.name}`}
                            value={person.role}
                            onChange={(event) => {
                              data.setUserRole(person._id, event.target.value);
                              showToast(`${person.name} is now ${event.target.value}`);
                            }}
                            className="rounded-md border border-border bg-surface px-2 py-1 text-xs"
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : null}

      {tab === "cities" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="Popular cities"
            description="Ranked by how many trips include them"
            items={cityUsage
              .slice()
              .sort((first, second) => second.trips - first.trips)
              .map((entry) => ({
                label: `${entry.city.name}, ${entry.city.country}`,
                value: Math.max(entry.trips, 0.2),
                caption: `${entry.trips} trips · ${entry.city.popularity} / 5`,
              }))}
          />

          <Card>
            <CardHeader
              title="Destination catalog"
              description="Add or retire the cities travellers can plan around."
            />
            <CardBody className="space-y-4">
              <form onSubmit={handleAddCity} className="grid gap-3 sm:grid-cols-3">
                <TextField
                  id="city-name"
                  label="City"
                  value={cityForm.name}
                  onChange={(event) => setCityForm({ ...cityForm, name: event.target.value })}
                />
                <TextField
                  id="city-country"
                  label="Country"
                  value={cityForm.country}
                  onChange={(event) => setCityForm({ ...cityForm, country: event.target.value })}
                />
                <SelectField
                  id="city-region"
                  label="Region"
                  value={cityForm.region}
                  onChange={(event) => setCityForm({ ...cityForm, region: event.target.value })}
                  options={regionOptions}
                />
                <Button type="submit" variant="secondary" className="sm:col-span-3">
                  Add city
                </Button>
              </form>

              <ul className="divide-y divide-border border-t border-border">
                {cities.map((city) => (
                  <li key={city._id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="truncate text-sm">
                      {city.name}, {city.country}
                      <span className="text-muted-foreground"> · {city.region}</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setConfirm({
                          kind: "city",
                          id: city._id,
                          title: "Remove this city?",
                          message: `${city.name} and its catalog activities will be removed.`,
                        })
                      }
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {tab === "activities" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="Popular activities"
            description="How often each catalog activity is added to a trip"
            items={activityUsage
              .slice()
              .sort((first, second) => second.uses - first.uses)
              .map((entry) => ({
                label: entry.activity.title,
                value: Math.max(entry.uses, 0.2),
                caption: `${entry.uses} users · ${entry.activity.rating} / 5`,
              }))}
          />

          <Card>
            <CardHeader title="Activity catalog" description={`${activities.length} activities`} />
            <CardBody className="px-0 py-0">
              <ul>
                {activities.map((activity) => (
                  <li
                    key={activity._id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border px-5 py-3.5 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{activity.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {activity.cityName} · {activity.category} · {formatMoney(activity.cost)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() =>
                        setConfirm({
                          kind: "activity",
                          id: activity._id,
                          title: "Remove this activity?",
                          message: `${activity.title} will no longer be suggested.`,
                        })
                      }
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {tab === "analytics" ? (
        <div className="space-y-6">
          <AdminStats stats={stats} />

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="Trips per traveller"
              description="Who is planning the most"
              orientation="vertical"
              items={users.map((person) => ({
                label: person.name.split(" ")[0],
                value: tripCountByUser[person._id],
              }))}
            />
            <ChartCard
              title="Budget vs recorded spend"
              description="Across every trip on the platform"
              items={[
                { label: "Planned budget", value: totalBudget, caption: formatMoney(totalBudget) },
                { label: "Recorded spend", value: totalSpent, caption: formatMoney(totalSpent) },
              ]}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="All trips" description="Every trip created on the platform" />
              <CardBody className="px-0 py-0">
                <ul>
                  {trips.map((trip) => {
                    const normalized = data.getTripById(trip._id);
                    return (
                      <li
                        key={trip._id}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border px-5 py-4 last:border-b-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{trip.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {data.getStopsForTrip(trip._id).length} stops · created{" "}
                            {formatDate(trip.createdAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-sm">{formatMoney(trip.totalBudget)}</span>
                          {normalized ? <StatusBadge status={normalized.status} /> : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Community moderation"
                description={`${posts.length} shared plans on the feed`}
              />
              <CardBody className="px-0 py-0">
                <ul>
                  {posts.map((post) => (
                    <li
                      key={post._id}
                      className="flex items-start justify-between gap-3 border-b border-border px-5 py-3.5 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{post.caption}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {post.likesCount} likes · {post.clonesCount} copies
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 whitespace-nowrap"
                        onClick={() =>
                          setConfirm({
                            kind: "post",
                            id: post._id,
                            title: "Take this plan down?",
                            message: "The plan disappears from the community feed.",
                          })
                        }
                      >
                        Take down
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}

      <Modal
        open={Boolean(viewedUser)}
        onClose={() => setViewedUser(null)}
        title={viewedUser ? viewedUser.name : ""}
        description={viewedUser ? viewedUser.email : ""}
        footer={
          <Button variant="secondary" onClick={() => setViewedUser(null)}>
            Close
          </Button>
        }
      >
        {viewedUser ? (
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="eyebrow">Location</dt>
              <dd className="mt-0.5 font-medium">
                {viewedUser.city}, {viewedUser.country}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Phone</dt>
              <dd className="mt-0.5 font-medium">{viewedUser.phone || "—"}</dd>
            </div>
            <div>
              <dt className="eyebrow">Trips</dt>
              <dd className="mt-0.5 font-medium">{tripCountByUser[viewedUser._id]}</dd>
            </div>
            <div>
              <dt className="eyebrow">Joined</dt>
              <dd className="mt-0.5 font-medium">{formatDate(viewedUser.createdAt)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="eyebrow">Bio</dt>
              <dd className="mt-0.5 text-muted-foreground">{viewedUser.bio || "—"}</dd>
            </div>
          </dl>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm ? confirm.title : ""}
        message={confirm ? confirm.message : ""}
        confirmLabel="Remove"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
