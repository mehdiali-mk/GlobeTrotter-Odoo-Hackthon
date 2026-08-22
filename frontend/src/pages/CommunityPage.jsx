import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import PageHeader from "../components/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Button, { ButtonLink } from "../components/ui/Button";
import Toolbar from "../components/ui/Toolbar";
import CommunityPost from "../components/CommunityPost";
import { EmptyState } from "../components/ui/States";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";

const groupOptions = [
  { value: "none", label: "Group by: nothing" },
  { value: "author", label: "Group by: traveller" },
  { value: "status", label: "Group by: trip status" },
];

const filterOptions = [
  { value: "all", label: "Filter: all posts" },
  { value: "mine", label: "Filter: my posts" },
  { value: "liked", label: "Filter: liked by me" },
];

const sortOptions = [
  { value: "recent", label: "Sort by: newest" },
  { value: "likes", label: "Sort by: most liked" },
  { value: "clones", label: "Sort by: most copied" },
];

// Screen 10 — community feed of shared trips and activities.
export default function CommunityPage() {
  const data = useAppData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [groupBy, setGroupBy] = useState("none");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const posts = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    const filtered = data.posts.filter((post) => {
      const trip = data.getTripById(post.trip);
      const author = data.getUserById(post.user);
      if (!trip) return false;

      const matchesSearch =
        search === "" ||
        `${trip.title} ${post.caption} ${author ? author.name : ""}`.toLowerCase().includes(search);

      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "mine" && post.user === data.currentUser._id) ||
        (filterBy === "liked" && data.hasLiked(post._id));

      return matchesSearch && matchesFilter;
    });

    return filtered.sort((first, second) => {
      if (sortBy === "likes") return second.likesCount - first.likesCount;
      if (sortBy === "clones") return second.clonesCount - first.clonesCount;
      return new Date(second.createdAt) - new Date(first.createdAt);
    });
  }, [data, searchText, filterBy, sortBy]);

  const groups = useMemo(() => {
    if (groupBy === "none") return [{ key: "All posts", posts }];
    const buckets = {};
    posts.forEach((post) => {
      const trip = data.getTripById(post.trip);
      const author = data.getUserById(post.user);
      const key =
        groupBy === "author" ? (author ? author.name : "Traveller") : trip ? trip.status : "other";
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(post);
    });
    return Object.keys(buckets)
      .sort()
      .map((key) => ({ key, posts: buckets[key] }));
  }, [posts, groupBy, data]);

  function handleCopy(trip) {
    const copy = data.cloneTrip(trip._id);
    if (!copy) return;
    showToast(`Copied "${trip.title}" into your trips`);
    navigate({ to: "/trips/$tripId/itinerary", params: { tripId: copy._id } });
  }

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Community"
        description="Trips and activities shared by other travellers. Copy a plan to make it your own."
        actions={
          <ButtonLink to="/trips" variant="secondary">
            Share a trip
          </ButtonLink>
        }
      />

      <Toolbar
        searchId="community-search"
        searchLabel="Search posts"
        searchPlaceholder="Search a trip, place or traveller"
        searchValue={searchText}
        onSearchChange={setSearchText}
        controls={[
          {
            id: "community-group",
            label: "Group by",
            value: groupBy,
            onChange: setGroupBy,
            options: groupOptions,
          },
          {
            id: "community-filter",
            label: "Filter",
            value: filterBy,
            onChange: setFilterBy,
            options: filterOptions,
          },
          {
            id: "community-sort",
            label: "Sort by",
            value: sortBy,
            onChange: setSortBy,
            options: sortOptions,
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-8">
          {posts.length > 0 ? (
            groups.map((group) => (
              <section key={group.key}>
                {groupBy !== "none" ? (
                  <h2 className="mb-3 text-base font-semibold capitalize">{group.key}</h2>
                ) : null}
                <div className="grid gap-5">
                  {group.posts.map((post) => {
                    const trip = data.getTripById(post.trip);
                    return (
                      <CommunityPost
                        key={post._id}
                        post={post}
                        author={data.getUserById(post.user)}
                        trip={trip}
                        stops={trip ? data.getStopsForTrip(trip._id) : []}
                        hasLiked={data.hasLiked(post._id)}
                        onLike={() => data.toggleLike(post._id)}
                        onShare={() => showToast("Post link copied to your clipboard")}
                        onView={() =>
                          trip
                            ? navigate({
                                to: "/trips/$tripId",
                                params: { tripId: trip._id },
                              })
                            : null
                        }
                        actions={
                          trip ? (
                            <Button variant="secondary" size="sm" onClick={() => handleCopy(trip)}>
                              Copy trip
                            </Button>
                          ) : null
                        }
                      />
                    );
                  })}
                </div>
              </section>
            ))
          ) : (
            <EmptyState
              title="No posts match this view"
              message="Clear the filter, or publish one of your own trips from My trips."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchText("");
                    setFilterBy("all");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          )}
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader
              title="How the community works"
              description="Share what worked, borrow what works."
            />
            <CardBody className="space-y-3 text-sm text-muted-foreground">
              <p>
                Every post is a real trip plan with its cities, activities and budget. Travellers
                use it to explain how a journey actually went.
              </p>
              <p>
                Search, filter and sort to find plans close to what you want, then copy one into
                your own trips and edit the details.
              </p>
              <p>
                Like a post to keep it in your liked list, and share your own trip from My trips to
                publish it here.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="This week" description="Activity across shared plans" />
            <CardBody>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="eyebrow">Posts</dt>
                  <dd className="mt-1 text-xl font-semibold">{data.posts.length}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Total likes</dt>
                  <dd className="mt-1 text-xl font-semibold">
                    {data.posts.reduce((total, post) => total + post.likesCount, 0)}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Plans copied</dt>
                  <dd className="mt-1 text-xl font-semibold">
                    {data.posts.reduce((total, post) => total + post.clonesCount, 0)}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Liked by you</dt>
                  <dd className="mt-1 text-xl font-semibold">{data.likedPostIds.length}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>
        </aside>
      </div>
    </>
  );
}
