// Who is allowed to do what on a trip.
// Roles: owner (creator), editor, viewer. Platform role: admin / user.

export const memberRoles = ["editor", "viewer"];
export const memberStatuses = ["pending", "accepted", "rejected"];

export function isAdmin(user) {
  return Boolean(user && user.role === "admin");
}

// The raw membership record ({ user, role, status }) for a user on a trip.
export function getMembership(trip, userId) {
  if (!trip || !userId) return null;
  return (trip.memberRoles || []).find((member) => member.user === userId) || null;
}

// owner | editor | viewer | null (not part of the trip)
export function getTripRole(trip, userId) {
  if (!trip || !userId) return null;
  if (trip.creator === userId) return "owner";
  const membership = getMembership(trip, userId);
  if (!membership || membership.status !== "accepted") return null;
  return membership.role || "viewer";
}

export function isTripMember(trip, userId) {
  return getTripRole(trip, userId) !== null;
}

export function canViewTrip(trip, user) {
  if (!trip || !user) return false;
  return Boolean(trip.isPublic) || isTripMember(trip, user._id) || isAdmin(user);
}

// Editors and owners may change itinerary, activities and expenses.
export function canEditTrip(trip, user) {
  if (!trip || !user) return false;
  const role = getTripRole(trip, user._id);
  return role === "owner" || role === "editor";
}

// Only the creator (or a platform admin) can rename, delete or manage members.
export function canManageTrip(trip, user) {
  if (!trip || !user) return false;
  return getTripRole(trip, user._id) === "owner" || isAdmin(user);
}

export function canManageMembers(trip, user) {
  return canManageTrip(trip, user);
}

export function canJoinTrip(trip, user) {
  if (!trip || !user) return false;
  if (isTripMember(trip, user._id)) return false;
  return trip.members.length < trip.maxMembers;
}

export function roleLabel(role) {
  if (role === "owner") return "Owner";
  if (role === "editor") return "Editor";
  if (role === "viewer") return "Viewer";
  return "Not a member";
}
