import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  users as seedUsers,
  cities as seedCities,
  activitiesCatalog as seedCatalog,
  trips as seedTrips,
  itineraryStops as seedStops,
  tripActivities as seedActivities,
  expenses as seedExpenses,
  communityPosts as seedPosts,
  currentUserId,
} from "../data/mockData";
import {
  findById,
  makeId,
  makeJoinCode,
  slugify,
  toIsoDate,
  getStatusFromDates,
  getDayNumber,
  normalizeTrip,
  normalizeTrips,
  filterTripsForUser,
  filterStopsForTrip,
  filterActivitiesForTrip,
  filterActivitiesForStop,
  filterExpensesForTrip,
  createTripRecord,
  applyTripEdits,
  createStopRecord,
  createActivityRecord,
  createExpenseRecord,
} from "../services/tripService";

// One place that holds the whole working dataset for the session.
// Every screen reads from here and calls the actions below to change data,
// so edits made on one page show up everywhere immediately.
const AppDataContext = createContext(null);

const SESSION_KEY = "globetrotter.session";

// Reads the demo session saved by a previous sign-in (browser only).
function readStoredSession() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function writeStoredSession(value) {
  if (typeof window === "undefined") return;
  try {
    if (value) window.localStorage.setItem(SESSION_KEY, value);
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage can be blocked; the session then only lives in memory.
  }
}

export function AppDataProvider({ children }) {
  const [users, setUsers] = useState(seedUsers);
  const [cities, setCities] = useState(seedCities);
  const [catalog, setCatalog] = useState(seedCatalog);
  const [trips, setTrips] = useState(seedTrips);
  const [stops, setStops] = useState(seedStops);
  const [activities, setActivities] = useState(seedActivities);
  const [expenses, setExpenses] = useState(seedExpenses);
  const [posts, setPosts] = useState(seedPosts);
  const [likedPostIds, setLikedPostIds] = useState([]);
  const [userId, setUserId] = useState(currentUserId);
  const [isSessionReady, setIsSessionReady] = useState(false);

  // Restore the demo session after hydration so server and client markup match.
  useEffect(() => {
    const stored = readStoredSession();
    if (stored) setUserId(stored);
    setIsSessionReady(true);
  }, []);

  const value = useMemo(() => {
    const normalizedTrips = normalizeTrips(trips);
    const currentUser = findById(users, userId);

    // --- reads ------------------------------------------------------------
    const getUserById = (id) => findById(users, id);
    const getCityById = (id) => findById(cities, id);
    const getCatalogActivityById = (id) => findById(catalog, id);
    const getTripById = (id) => normalizedTrips.find((trip) => trip._id === id) || null;
    const getStopsForTrip = (tripId) => filterStopsForTrip(stops, tripId);
    const getActivitiesForStop = (stopId) => filterActivitiesForStop(activities, stopId);

    // Activities for a trip follow the stop order, then the stored order.
    const getActivitiesForTrip = (tripId) => {
      const tripStops = filterStopsForTrip(stops, tripId);
      const ordered = tripStops.flatMap((stop) => filterActivitiesForStop(activities, stop._id));
      const looseActivities = filterActivitiesForTrip(activities, tripId).filter(
        (activity) => !ordered.includes(activity),
      );
      return [...ordered, ...looseActivities];
    };

    const getExpensesForTrip = (tripId) => filterExpensesForTrip(expenses, tripId);
    const getMembersForTrip = (trip) =>
      (trip.members || []).map((memberId) => findById(users, memberId)).filter(Boolean);

    // --- trips ------------------------------------------------------------
    function createTrip(values) {
      const trip = createTripRecord(values, userId);
      setTrips((current) => [...current, trip]);

      const city = values.firstCity ? findById(cities, values.firstCity) : null;
      if (city) {
        const stop = createStopRecord(
          {
            arrivalDate: values.startDate,
            departureDate: values.endDate,
            accommodation: values.accommodation,
            notes: "",
          },
          trip._id,
          city,
          1,
        );
        setStops((current) => [...current, stop]);

        // Suggested catalog activities picked while creating the trip are added
        // to the first stop straight away.
        const picked = (values.suggestedActivities || [])
          .map((catalogId) => findById(catalog, catalogId))
          .filter(Boolean);

        if (picked.length > 0) {
          const newActivities = picked.map((catalogActivity) =>
            createActivityRecord(
              {
                catalogActivity: catalogActivity._id,
                title: catalogActivity.title,
                category: catalogActivity.category,
                cost: catalogActivity.cost,
                scheduledDate: stop.arrivalDate,
                startTime: "10:00 AM",
                durationHours: 2,
              },
              trip,
              stop._id,
              userId,
            ),
          );
          setActivities((current) => [...current, ...newActivities]);
        }
      }

      return normalizeTrip(trip);
    }

    function updateTrip(tripId, values) {
      setTrips((current) =>
        current.map((trip) => (trip._id === tripId ? applyTripEdits(trip, values) : trip)),
      );
    }

    function setTripVisibility(tripId, isPublic) {
      setTrips((current) =>
        current.map((trip) => (trip._id === tripId ? { ...trip, isPublic } : trip)),
      );
      if (!isPublic) {
        setPosts((current) => current.filter((post) => post.trip !== tripId));
      }
    }

    function shareTrip(tripId, caption) {
      const trip = findById(trips, tripId);
      if (!trip) return;
      setTrips((current) =>
        current.map((item) => (item._id === tripId ? { ...item, isPublic: true } : item)),
      );
      setPosts((current) => {
        if (current.some((post) => post.trip === tripId)) return current;
        return [
          {
            _id: makeId("post"),
            trip: tripId,
            user: userId,
            caption: caption || trip.description || trip.title,
            likesCount: 0,
            clonesCount: 0,
            createdAt: new Date().toISOString(),
          },
          ...current,
        ];
      });
    }

    function deleteTrip(tripId) {
      const tripStopIds = stops.filter((stop) => stop.trip === tripId).map((stop) => stop._id);
      setTrips((current) => current.filter((trip) => trip._id !== tripId));
      setStops((current) => current.filter((stop) => stop.trip !== tripId));
      setActivities((current) =>
        current.filter(
          (activity) => activity.trip !== tripId && !tripStopIds.includes(activity.stop),
        ),
      );
      setExpenses((current) => current.filter((expense) => expense.trip !== tripId));
      setPosts((current) => current.filter((post) => post.trip !== tripId));
    }

    // Copies a public plan into a private trip owned by the current user.
    function cloneTrip(tripId) {
      const source = findById(trips, tripId);
      if (!source) return null;

      const newTrip = {
        ...source,
        _id: makeId("trip"),
        creator: userId,
        title: `${source.title} (copy)`,
        slug: slugify(`${source.title} copy`),
        isPublic: false,
        joinCode: makeJoinCode(source.title),
        members: [],
        createdAt: new Date().toISOString(),
        status: getStatusFromDates(source.startDate, source.endDate),
      };

      const sourceStops = filterStopsForTrip(stops, tripId);
      const newStops = [];
      const newActivities = [];

      sourceStops.forEach((stop) => {
        const newStopId = makeId("stop");
        newStops.push({ ...stop, _id: newStopId, trip: newTrip._id });
        filterActivitiesForStop(activities, stop._id).forEach((activity) => {
          newActivities.push({
            ...activity,
            _id: makeId("act"),
            trip: newTrip._id,
            stop: newStopId,
            isCompleted: false,
            addedBy: userId,
          });
        });
      });

      setTrips((current) => [...current, newTrip]);
      setStops((current) => [...current, ...newStops]);
      setActivities((current) => [...current, ...newActivities]);
      setPosts((current) =>
        current.map((post) =>
          post.trip === tripId ? { ...post, clonesCount: post.clonesCount + 1 } : post,
        ),
      );

      return normalizeTrip(newTrip);
    }

    // --- stops ------------------------------------------------------------
    function addStop(tripId, values) {
      const city = findById(cities, values.city);
      const order = filterStopsForTrip(stops, tripId).length + 1;
      const stop = createStopRecord(values, tripId, city, order);
      setStops((current) => [...current, stop]);
      return stop;
    }

    function updateStop(stopId, values) {
      setStops((current) =>
        current.map((stop) => {
          if (stop._id !== stopId) return stop;
          const city = values.city ? findById(cities, values.city) : null;
          return {
            ...stop,
            city: city ? city._id : stop.city,
            cityName: city ? city.name : stop.cityName,
            arrivalDate: toIsoDate(values.arrivalDate) || stop.arrivalDate,
            departureDate: toIsoDate(values.departureDate) || stop.departureDate,
            accommodation: (values.accommodation || "").trim(),
            notes: (values.notes || "").trim(),
          };
        }),
      );
    }

    function removeStop(stopId) {
      const stop = findById(stops, stopId);
      if (!stop) return;
      const remaining = filterStopsForTrip(stops, stop.trip)
        .filter((item) => item._id !== stopId)
        .map((item, index) => ({ ...item, stopOrder: index + 1 }));

      setStops((current) => [...current.filter((item) => item.trip !== stop.trip), ...remaining]);
      setActivities((current) => current.filter((activity) => activity.stop !== stopId));
    }

    // direction is -1 (earlier) or 1 (later).
    function moveStop(stopId, direction) {
      const stop = findById(stops, stopId);
      if (!stop) return;
      const ordered = filterStopsForTrip(stops, stop.trip);
      const index = ordered.findIndex((item) => item._id === stopId);
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= ordered.length) return;

      const reordered = [...ordered];
      reordered[index] = ordered[targetIndex];
      reordered[targetIndex] = ordered[index];
      const renumbered = reordered.map((item, position) => ({ ...item, stopOrder: position + 1 }));

      setStops((current) => [...current.filter((item) => item.trip !== stop.trip), ...renumbered]);
    }

    // --- activities -------------------------------------------------------
    function addActivity(tripId, stopId, values) {
      const trip = findById(trips, tripId);
      if (!trip) return null;
      const activity = createActivityRecord(values, trip, stopId, userId);
      setActivities((current) => [...current, activity]);
      return activity;
    }

    // Adds a catalog item to the first stop that matches its city.
    function addCatalogActivityToTrip(tripId, catalogId, options = {}) {
      const trip = findById(trips, tripId);
      const catalogActivity = findById(catalog, catalogId);
      if (!trip || !catalogActivity) return null;

      const tripStops = filterStopsForTrip(stops, tripId);
      const matchingStop =
        tripStops.find((stop) => stop.city === catalogActivity.city) || tripStops[0];
      if (!matchingStop) return null;

      const activity = createActivityRecord(
        {
          catalogActivity: catalogActivity._id,
          title: catalogActivity.title,
          category: catalogActivity.category,
          cost: catalogActivity.cost,
          scheduledDate: options.scheduledDate || matchingStop.arrivalDate,
          startTime: options.startTime || "10:00 AM",
          durationHours: options.durationHours || 2,
        },
        trip,
        matchingStop._id,
        userId,
      );

      setActivities((current) => [...current, activity]);
      return activity;
    }

    function updateActivity(activityId, values) {
      setActivities((current) =>
        current.map((activity) => {
          if (activity._id !== activityId) return activity;
          const trip = findById(trips, activity.trip);
          const scheduledDate = toIsoDate(values.scheduledDate) || activity.scheduledDate;
          return {
            ...activity,
            title: values.title.trim(),
            category: values.category || activity.category,
            cost: Number(values.cost || 0),
            scheduledDate,
            dayNumber: trip ? getDayNumber(trip.startDate, scheduledDate) : activity.dayNumber,
            startTime: values.startTime || activity.startTime,
            durationHours: Number(values.durationHours || activity.durationHours),
          };
        }),
      );
    }

    function removeActivity(activityId) {
      setActivities((current) => current.filter((activity) => activity._id !== activityId));
    }

    function toggleActivityCompleted(activityId) {
      setActivities((current) =>
        current.map((activity) =>
          activity._id === activityId
            ? { ...activity, isCompleted: !activity.isCompleted }
            : activity,
        ),
      );
    }

    // Reorders an activity inside its own stop.
    function moveActivity(activityId, direction) {
      const activity = findById(activities, activityId);
      if (!activity) return;
      const inStop = filterActivitiesForStop(activities, activity.stop);
      const index = inStop.findIndex((item) => item._id === activityId);
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= inStop.length) return;

      const reordered = [...inStop];
      reordered[index] = inStop[targetIndex];
      reordered[targetIndex] = inStop[index];

      setActivities((current) => [
        ...current.filter((item) => item.stop !== activity.stop),
        ...reordered,
      ]);
    }

    // --- expenses ---------------------------------------------------------
    function addExpense(tripId, values) {
      const trip = getTripById(tripId);
      if (!trip) return null;
      const expense = createExpenseRecord(values, trip, userId);
      setExpenses((current) => [...current, expense]);
      return expense;
    }

    function updateExpense(expenseId, values) {
      setExpenses((current) =>
        current.map((expense) => {
          if (expense._id !== expenseId) return expense;
          return {
            ...expense,
            title: values.title.trim(),
            amount: Number(values.amount || 0),
            category: values.category || expense.category,
            date: toIsoDate(values.date) || expense.date,
            paidBy: values.paidBy || expense.paidBy,
            splitAmong:
              values.splitAmong && values.splitAmong.length > 0
                ? values.splitAmong
                : expense.splitAmong,
          };
        }),
      );
    }

    function removeExpense(expenseId) {
      setExpenses((current) => current.filter((expense) => expense._id !== expenseId));
    }

    // --- trip members -----------------------------------------------------
    // Members are stored on the trip as { user, role, status }. The creator is
    // always the owner and is not repeated in that list.
    function getMemberDetails(trip) {
      if (!trip) return [];
      const owner = findById(users, trip.creator);
      const ownerRow = owner ? [{ user: owner, role: "owner", status: "accepted" }] : [];
      const rest = (trip.memberRoles || [])
        .map((member) => ({
          user: findById(users, member.user),
          role: member.role || "viewer",
          status: member.status || "pending",
        }))
        .filter((member) => member.user);
      return [...ownerRow, ...rest];
    }

    function setTripMembers(tripId, updater) {
      setTrips((current) =>
        current.map((trip) =>
          trip._id === tripId ? { ...trip, members: updater(trip.members || []) } : trip,
        ),
      );
    }

    function acceptedCount(trip) {
      return 1 + (trip.members || []).filter((member) => member.status === "accepted").length;
    }

    // Adds the current user (or a given user) to a trip if there is room.
    function joinTrip(tripId, joiningUserId = userId, role = "viewer") {
      const trip = findById(trips, tripId);
      if (!trip) return { ok: false, message: "Trip not found." };
      if (trip.creator === joiningUserId) return { ok: false, message: "You own this trip." };

      const existing = (trip.members || []).find((member) => member.user === joiningUserId);
      if (existing && existing.status === "accepted") {
        return { ok: false, message: "Already a member of this trip." };
      }
      if (acceptedCount(trip) >= trip.maxMembers) {
        return { ok: false, message: "This trip is already full." };
      }

      setTripMembers(tripId, (members) => {
        if (existing) {
          return members.map((member) =>
            member.user === joiningUserId ? { ...member, status: "accepted", role } : member,
          );
        }
        return [...members, { user: joiningUserId, role, status: "accepted" }];
      });

      return { ok: true, message: `Joined ${trip.title}`, trip: normalizeTrip(trip) };
    }

    function joinTripByCode(code) {
      const cleaned = String(code || "")
        .trim()
        .toUpperCase();
      if (!cleaned) return { ok: false, message: "Enter a join code." };
      const trip = trips.find((item) => String(item.joinCode).toUpperCase() === cleaned);
      if (!trip) return { ok: false, message: "No trip matches that join code." };
      const result = joinTrip(trip._id);
      return { ...result, trip: normalizeTrip(trip) };
    }

    function leaveTrip(tripId, leavingUserId = userId) {
      const trip = findById(trips, tripId);
      if (!trip) return { ok: false, message: "Trip not found." };
      if (trip.creator === leavingUserId) {
        return { ok: false, message: "The owner cannot leave their own trip." };
      }
      setTripMembers(tripId, (members) =>
        members.filter((member) => member.user !== leavingUserId),
      );
      return { ok: true, message: `Left ${trip.title}` };
    }

    // Owner invites someone by email; they start as pending.
    function inviteMember(tripId, email, role = "viewer") {
      const trip = findById(trips, tripId);
      if (!trip) return { ok: false, message: "Trip not found." };
      const person = users.find(
        (user) =>
          user.email.toLowerCase() ===
          String(email || "")
            .trim()
            .toLowerCase(),
      );
      if (!person) return { ok: false, message: "No GlobeTrotter account uses that email." };
      if (person._id === trip.creator || (trip.members || []).some((m) => m.user === person._id)) {
        return { ok: false, message: `${person.name} is already on this trip.` };
      }
      if ((trip.members || []).length + 1 >= trip.maxMembers) {
        return { ok: false, message: "Member capacity reached." };
      }
      setTripMembers(tripId, (members) => [
        ...members,
        { user: person._id, role, status: "pending" },
      ]);
      return { ok: true, message: `Invite sent to ${person.name}` };
    }

    function setMemberRole(tripId, memberUserId, role) {
      setTripMembers(tripId, (members) =>
        members.map((member) => (member.user === memberUserId ? { ...member, role } : member)),
      );
    }

    function setMemberStatus(tripId, memberUserId, status) {
      setTripMembers(tripId, (members) =>
        members.map((member) => (member.user === memberUserId ? { ...member, status } : member)),
      );
    }

    function removeMember(tripId, memberUserId) {
      setTripMembers(tripId, (members) => members.filter((member) => member.user !== memberUserId));
    }

    // --- community --------------------------------------------------------
    function toggleLike(postId) {
      const hasLiked = likedPostIds.includes(postId);
      setLikedPostIds((current) =>
        hasLiked ? current.filter((id) => id !== postId) : [...current, postId],
      );
      setPosts((current) =>
        current.map((post) =>
          post._id === postId
            ? { ...post, likesCount: post.likesCount + (hasLiked ? -1 : 1) }
            : post,
        ),
      );
      return !hasLiked;
    }

    // --- profile ----------------------------------------------------------
    function updateProfile(values) {
      setUsers((current) =>
        current.map((user) =>
          user._id === userId
            ? {
                ...user,
                name: values.name.trim(),
                email: values.email.trim(),
                phone: values.phone,
                city: values.city,
                country: values.country,
                bio: values.bio,
              }
            : user,
        ),
      );
    }

    function toggleSavedDestination(cityId) {
      let isSaved = false;
      setUsers((current) =>
        current.map((user) => {
          if (user._id !== userId) return user;
          const saved = user.savedDestinations || [];
          isSaved = !saved.includes(cityId);
          return {
            ...user,
            savedDestinations: saved.includes(cityId)
              ? saved.filter((id) => id !== cityId)
              : [...saved, cityId],
          };
        }),
      );
      return isSaved;
    }

    function isDestinationSaved(cityId) {
      return Boolean(currentUser && (currentUser.savedDestinations || []).includes(cityId));
    }

    // --- authentication (demo layer, swapped for the API in Part 5) --------
    // Any password is accepted for the seeded demo accounts; the email decides
    // who is signed in and the session id is remembered in localStorage.
    function signIn(email, password) {
      const match = users.find(
        (user) =>
          user.email.toLowerCase() ===
          String(email || "")
            .trim()
            .toLowerCase(),
      );
      if (!match) return { ok: false, message: "No account uses that email address." };
      if (!password) return { ok: false, message: "Enter your password." };
      setUserId(match._id);
      writeStoredSession(match._id);
      return { ok: true, user: match, message: `Signed in as ${match.name}` };
    }

    function signInAs(email) {
      const result = signIn(email, "demo");
      return result.ok ? result.user : currentUser;
    }

    // Development helper for the user switcher in the header.
    function switchUser(nextUserId) {
      const match = findById(users, nextUserId);
      if (!match) return null;
      setUserId(match._id);
      writeStoredSession(match._id);
      return match;
    }

    function signOut() {
      writeStoredSession(null);
      setUserId(null);
    }

    function registerUser(values) {
      const email = String(values.email || "").trim();
      if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
        return { ok: false, message: "That email already has an account." };
      }
      const newUser = {
        _id: makeId("usr"),
        name: values.name.trim(),
        email,
        phone: values.phone || "",
        city: values.city || "",
        country: values.country || "",
        bio: values.bio || "",
        photo: values.photo || "",
        role: "user",
        savedDestinations: [],
        createdAt: new Date().toISOString(),
      };
      setUsers((current) => [...current, newUser]);
      setUserId(newUser._id);
      writeStoredSession(newUser._id);
      return { ok: true, user: newUser, message: `Welcome to GlobeTrotter, ${newUser.name}` };
    }

    // --- admin catalog management ------------------------------------------
    function addCity(values) {
      const city = {
        _id: makeId("city"),
        name: values.name.trim(),
        country: (values.country || "").trim(),
        region: values.region || "Europe",
        image: values.image || "",
        description: (values.description || "").trim(),
        costIndex: values.costIndex || "$$",
        popularity: Number(values.popularity || 4),
        isTopAttraction: values.isTopAttraction === true || values.isTopAttraction === "true",
      };
      setCities((current) => [...current, city]);
      return city;
    }

    function updateCity(cityId, values) {
      setCities((current) =>
        current.map((city) =>
          city._id === cityId
            ? {
                ...city,
                name: values.name.trim(),
                country: values.country,
                region: values.region,
                description: values.description,
                costIndex: values.costIndex,
                popularity: Number(values.popularity || city.popularity),
              }
            : city,
        ),
      );
    }

    function removeCity(cityId) {
      setCities((current) => current.filter((city) => city._id !== cityId));
      setCatalog((current) => current.filter((item) => item.city !== cityId));
      setUsers((current) =>
        current.map((user) => ({
          ...user,
          savedDestinations: (user.savedDestinations || []).filter((id) => id !== cityId),
        })),
      );
    }

    function addCatalogActivity(values) {
      const city = findById(cities, values.city);
      const item = {
        _id: makeId("cat_act"),
        city: values.city,
        cityName: city ? city.name : "",
        title: values.title.trim(),
        category: values.category || "Sightseeing",
        cost: Number(values.cost || 0),
        duration: values.duration || "2 hours",
        image: values.image || "",
        description: (values.description || "").trim(),
        rating: Number(values.rating || 4.5),
      };
      setCatalog((current) => [...current, item]);
      return item;
    }

    function updateCatalogActivity(activityId, values) {
      setCatalog((current) =>
        current.map((item) => {
          if (item._id !== activityId) return item;
          const city = values.city ? findById(cities, values.city) : null;
          return {
            ...item,
            title: values.title.trim(),
            city: city ? city._id : item.city,
            cityName: city ? city.name : item.cityName,
            category: values.category || item.category,
            cost: Number(values.cost || 0),
            duration: values.duration || item.duration,
            description: values.description,
            rating: Number(values.rating || item.rating),
          };
        }),
      );
    }

    function removeCatalogActivity(activityId) {
      setCatalog((current) => current.filter((item) => item._id !== activityId));
      setActivities((current) =>
        current.map((activity) =>
          activity.catalogActivity === activityId
            ? { ...activity, catalogActivity: null }
            : activity,
        ),
      );
    }

    // Admin: promote or demote a platform account.
    function setUserRole(targetUserId, role) {
      setUsers((current) =>
        current.map((user) => (user._id === targetUserId ? { ...user, role } : user)),
      );
    }

    // Admin moderation: takes a shared plan off the community feed.
    function removePost(postId) {
      setPosts((current) => current.filter((post) => post._id !== postId));
    }

    return {
      // raw collections
      users,
      cities,
      catalog,
      trips: normalizedTrips,
      stops,
      activities,
      expenses,
      posts,
      likedPostIds,
      currentUser,
      isAuthenticated: Boolean(currentUser),
      isSessionReady,

      // reads
      getUserById,
      getCityById,
      getCatalogActivityById,
      getTripById,
      getTripsForUser: (id) => filterTripsForUser(normalizedTrips, id || userId),
      getMyTrips: () => filterTripsForUser(normalizedTrips, userId),
      getPublicTrips: () => normalizedTrips.filter((trip) => trip.isPublic),
      getStopsForTrip,
      getActivitiesForTrip,
      getActivitiesForStop,
      getExpensesForTrip,
      getMembersForTrip,
      getMemberDetails,
      isDestinationSaved,
      hasLiked: (postId) => likedPostIds.includes(postId),

      // actions
      createTrip,
      updateTrip,
      deleteTrip,
      cloneTrip,
      shareTrip,
      setTripVisibility,
      addStop,
      updateStop,
      removeStop,
      moveStop,
      addActivity,
      addCatalogActivityToTrip,
      updateActivity,
      removeActivity,
      toggleActivityCompleted,
      moveActivity,
      addExpense,
      updateExpense,
      removeExpense,
      joinTrip,
      joinTripByCode,
      leaveTrip,
      inviteMember,
      setMemberRole,
      setMemberStatus,
      removeMember,
      toggleLike,
      updateProfile,
      toggleSavedDestination,

      // auth
      signIn,
      signInAs,
      signOut,
      switchUser,
      registerUser,

      // admin
      addCity,
      updateCity,
      removeCity,
      addCatalogActivity,
      updateCatalogActivity,
      removeCatalogActivity,
      setUserRole,
      removePost,
    };
  }, [
    users,
    cities,
    catalog,
    trips,
    stops,
    activities,
    expenses,
    posts,
    likedPostIds,
    userId,
    isSessionReady,
  ]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used inside <AppDataProvider>.");
  }
  return context;
}
