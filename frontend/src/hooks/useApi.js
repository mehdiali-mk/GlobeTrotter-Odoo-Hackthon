import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/api/authService';
import { userService } from '../services/api/userService';
import { tripService } from '../services/api/tripService';
import { catalogService } from '../services/api/catalogService';

// ─── CATALOG ──────────────────────────────────────────────────────────────────

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: () => catalogService.searchCities(),
    select: (data) => data.data.cities,
  });
}

export function useCatalog() {
  return useQuery({
    queryKey: ['catalog'],
    queryFn: () => catalogService.searchActivities(),
    select: (data) => data.data.activities,
  });
}

// ─── AUTHENTICATION ──────────────────────────────────────────────────────────

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }) => authService.login(email, password),
    onSuccess: (data) => {
      localStorage.setItem('globetrotter.token', data.token);
      queryClient.setQueryData(['currentUser'], data.data.user);
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userData) => authService.signup(userData),
    onSuccess: (data) => {
      localStorage.setItem('globetrotter.token', data.token);
      queryClient.setQueryData(['currentUser'], data.data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    localStorage.removeItem('globetrotter.token');
    queryClient.clear();
  };
}

// ─── USER PROFILE ─────────────────────────────────────────────────────────────

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: userService.getMe,
    select: (data) => data.data.user,
    retry: false, // Don't retry if unauthorized
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userData) => userService.updateMe(userData),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.data.user);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userData) => userService.updateProfile(userData),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.data.user);
    },
  });
}

// ─── TRIP MEMBERSHIPS ────────────────────────────────────────────────────────

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, email, role }) => tripService.inviteMember(tripId, email, role),
    onSuccess: (data, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: ['itinerary', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, userId, role }) => tripService.updateMember(tripId, userId, role),
    onSuccess: (data, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: ['itinerary', tripId] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, userId }) => tripService.removeMember(tripId, userId),
    onSuccess: (data, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: ['itinerary', tripId] });
    },
  });
}

export function useJoinTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ joinCode }) => tripService.joinTrip(joinCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

// ─── TRIPS ────────────────────────────────────────────────────────────────────

export function useMyTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: tripService.getAllTrips,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data.data.trips
  });
}

export function useTrip(tripId) {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripService.getTrip(tripId),
    enabled: !!tripId,
    select: (data) => data.data.trip
  });
}

export function usePublicTrips() {
  return useQuery({
    queryKey: ['publicTrips'],
    queryFn: () => tripService.getPublicTrips(),
    select: (data) => data.data.trips,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripData) => tripService.createTrip(tripData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => tripService.updateTrip(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['tripItinerary', variables.id] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => tripService.deleteTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useCloneTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug) => tripService.cloneTrip(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useTripItinerary(tripId) {
  return useQuery({
    queryKey: ['tripItinerary', tripId],
    queryFn: () => tripService.getTripItinerary(tripId),
    select: (data) => data.data,
    enabled: !!tripId,
  });
}

export function useJoinTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (joinCode) => tripService.joinTrip(joinCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useLeaveTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, userId }) => tripService.removeMember(tripId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useAddStop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, ...data }) => tripService.addStop(tripId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tripItinerary', variables.tripId] });
    },
  });
}

export function useUpdateStop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, stopId, ...data }) => tripService.updateStop(tripId, stopId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tripItinerary', variables.tripId] });
    },
  });
}

export function useDeleteStop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, stopId }) => tripService.deleteStop(tripId, stopId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tripItinerary', variables.tripId] });
    },
  });
}

export function useAddActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (activityData) => tripService.addActivity(activityData.tripId, activityData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tripItinerary', variables.tripId] });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, activityId, activityData }) => tripService.updateActivity(tripId, activityId, activityData),
    onSuccess: (data, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: ['tripItinerary', tripId] });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, activityId }) => tripService.deleteActivity(tripId, activityId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tripItinerary', variables.tripId] });
    },
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, ...data }) => tripService.addExpense(tripId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tripItinerary', variables.tripId] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, expenseId }) => tripService.deleteExpense(tripId, expenseId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tripItinerary', variables.tripId] });
    },
  });
}
