// Single source of frontend data for GlobeTrotter.
// In the API part these arrays are replaced by responses with the same shape,
// so each array maps 1:1 to a MongoDB collection:
// users, cities, activitiesCatalog, trips, itineraryStops, tripActivities,
// expenses, communityPosts.

// =====================================================
// 1. USERS
// =====================================================

export const users = [
  {
    _id: "usr_01",
    name: "Mehdiali Kadiwala",
    email: "mehdiali@example.com",
    phone: "+91 9876543210",
    city: "Ahmedabad",
    country: "India",
    bio: "Software developer and organizer.",
    photo: "avatar1.jpg",
    role: "admin",
    savedDestinations: ["city_01"],
    createdAt: "2026-01-15T08:00:00.000Z",
  },
  {
    _id: "usr_02",
    name: "Himanshu",
    email: "himanshu@example.com",
    phone: "+91 9123456780",
    city: "Ahmedabad",
    country: "India",
    bio: "Frontend specialist.",
    photo: "avatar2.jpg",
    role: "user",
    savedDestinations: [],
    createdAt: "2026-02-10T10:30:00.000Z",
  },
  {
    _id: "usr_03",
    name: "Kumail",
    email: "kumail@example.com",
    phone: "+91 9234567890",
    city: "Ahmedabad",
    country: "India",
    bio: "Backend engineer.",
    photo: "avatar3.jpg",
    role: "user",
    savedDestinations: [],
    createdAt: "2026-02-11T11:00:00.000Z",
  },
  {
    _id: "usr_04",
    name: "Rehan",
    email: "rehan@example.com",
    phone: "+91 9345678901",
    city: "Ahmedabad",
    country: "India",
    bio: "UI/UX and logic.",
    photo: "avatar4.jpg",
    role: "user",
    savedDestinations: [],
    createdAt: "2026-02-12T12:00:00.000Z",
  },
];

// =====================================================
// 2. CITIES
// =====================================================

export const cities = [
  {
    _id: "city_01",
    name: "Paris",
    country: "France",
    region: "Europe",
    image: "paris.jpg",
    description: "The City of Light.",
    costIndex: "₹₹₹",
    popularity: 4.9,
    isTopAttraction: true,
  },
  {
    _id: "city_02",
    name: "Tokyo",
    country: "Japan",
    region: "Asia",
    image: "tokyo.jpg",
    description: "Vibrant metropolis.",
    costIndex: "₹₹₹",
    popularity: 4.8,
    isTopAttraction: true,
  },
];

// =====================================================
// 3. ACTIVITIES CATALOG
// =====================================================

export const activitiesCatalog = [
  {
    _id: "cat_act_01",
    city: "city_01",
    cityName: "Paris",
    title: "Eiffel Tower Access",
    category: "Sightseeing",
    cost: 45,
    duration: "2.5 hours",
    image: "eiffel.jpg",
    description: "Ascend the Eiffel Tower.",
    rating: 4.9,
  },
];

// =====================================================
// 4. TRIPS
// =====================================================

export const trips = [
  {
    _id: "trip_01",
    creator: "usr_01",
    title: "Odoo Hackathon Euro Tour",
    slug: "odoo-hackathon-euro-tour",
    description: "Team trip for the hackathon mixed with sightseeing.",
    coverPhoto: "euro_trip.jpg",
    startDate: "2026-09-10T00:00:00.000Z",
    endDate: "2026-09-20T00:00:00.000Z",
    status: "upcoming",
    isPublic: true,
    totalBudget: 4000,
    maxMembers: 4,
    joinCode: "HACK2026",
    members: [
      { user: "usr_02", role: "editor", status: "accepted" },
      { user: "usr_03", role: "editor", status: "accepted" },
      { user: "usr_04", role: "editor", status: "accepted" },
    ],
    createdAt: "2026-08-20T10:00:00.000Z",
  },
];

// =====================================================
// 5. ITINERARY STOPS
// =====================================================

export const itineraryStops = [
  {
    _id: "stop_01",
    trip: "trip_01",
    city: "city_01",
    cityName: "Paris",
    arrivalDate: "2026-09-10T00:00:00.000Z",
    departureDate: "2026-09-15T00:00:00.000Z",
    stopOrder: 1,
    accommodation: "Airbnb Le Marais",
    notes: "Grab local SIM cards at CDG airport.",
  },
];

// =====================================================
// 6. TRIP ACTIVITIES
// =====================================================

export const tripActivities = [
  {
    _id: "act_01",
    stop: "stop_01",
    trip: "trip_01",
    catalogActivity: null,
    title: "Hackathon Venue Registration",
    category: "Other",
    cost: 0,
    scheduledDate: "2026-09-11T00:00:00.000Z",
    dayNumber: 2,
    startTime: "09:00 AM",
    durationHours: 4,
    isCompleted: false,
    addedBy: "usr_01",
  },
  {
    _id: "act_02",
    stop: "stop_01",
    trip: "trip_01",
    catalogActivity: "cat_act_01",
    title: "Team Dinner & Eiffel",
    category: "Food",
    cost: 120,
    scheduledDate: "2026-09-11T00:00:00.000Z",
    dayNumber: 2,
    startTime: "08:00 PM",
    durationHours: 2,
    isCompleted: false,
    addedBy: "usr_02",
  },
];

// =====================================================
// 7. EXPENSES
// =====================================================

export const expenses = [
  {
    _id: "exp_01",
    trip: "trip_01",
    title: "Group Flight Tickets",
    amount: 1600,
    category: "Transport",
    date: "2026-08-21T09:00:00.000Z",
    paidBy: "usr_01",
    splitAmong: ["usr_01", "usr_02", "usr_03", "usr_04"],
  },
  {
    _id: "exp_02",
    trip: "trip_01",
    title: "Airbnb Booking",
    amount: 800,
    category: "Stay",
    date: "2026-08-22T14:00:00.000Z",
    paidBy: "usr_03",
    splitAmong: ["usr_01", "usr_02", "usr_03", "usr_04"],
  },
];

// =====================================================
// 8. COMMUNITY POSTS
// =====================================================

export const communityPosts = [
  {
    _id: "post_01",
    trip: "trip_01",
    user: "usr_01",
    caption:
      "Our game plan for the upcoming Odoo Hackathon in Paris! Structured for max productivity.",
    likesCount: 24,
    clonesCount: 5,
    createdAt: "2026-08-22T10:15:00.000Z",
  },
];

// The signed in demo user for the frontend build.
export const currentUserId = "usr_01";
