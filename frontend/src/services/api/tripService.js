import apiClient from './apiClient';

export const tripService = {
  getAllTrips: async (queryParams = '') => {
    const response = await apiClient.get(`/trips${queryParams}`);
    return response.data;
  },

  getTrip: async (id) => {
    const response = await apiClient.get(`/trips/${id}`);
    return response.data;
  },

  createTrip: async (tripData) => {
    const response = await apiClient.post('/trips', tripData);
    return response.data;
  },

  updateTrip: async (id, tripData) => {
    const response = await apiClient.patch(`/trips/${id}`, tripData);
    return response.data;
  },

  deleteTrip: async (id) => {
    const response = await apiClient.delete(`/trips/${id}`);
    return response.data;
  },

  // Public trips
  getPublicTrips: async (queryParams = '') => {
    const response = await apiClient.get(`/trips/public${queryParams}`);
    return response.data;
  },

  getPublicTrip: async (slug) => {
    const response = await apiClient.get(`/trips/public/${slug}`);
    return response.data;
  },

  cloneTrip: async (slug) => {
    const response = await apiClient.post(`/trips/public/${slug}/clone`);
    return response.data;
  },

  getTripsByStatus: async (status) => {
    const response = await apiClient.get(`/trips/status/${status}`);
    return response.data;
  },
  
  // Itinerary View
  getTripItinerary: async (tripId) => {
    const response = await apiClient.get(`/trips/${tripId}/itinerary`);
    return response.data;
  },

  // Memberships
  joinTrip: async (joinCode) => {
    const response = await apiClient.post('/trips/join', { joinCode });
    return response.data;
  },
  inviteMember: async (tripId, email) => {
    const response = await apiClient.post(`/trips/${tripId}/invite`, { email });
    return response.data;
  },
  updateMember: async (tripId, userId, role) => {
    const response = await apiClient.patch(`/trips/${tripId}/members/${userId}`, { role });
    return response.data;
  },
  removeMember: async (tripId, userId) => {
    const response = await apiClient.delete(`/trips/${tripId}/members/${userId}`);
    return response.data;
  },

  // Itinerary Stops
  addStop: async (tripId, stopData) => {
    const response = await apiClient.post(`/trips/${tripId}/stops`, stopData);
    return response.data;
  },
  updateStop: async (tripId, stopId, stopData) => {
    const response = await apiClient.patch(`/trips/${tripId}/stops/${stopId}`, stopData);
    return response.data;
  },
  deleteStop: async (tripId, stopId) => {
    const response = await apiClient.delete(`/trips/${tripId}/stops/${stopId}`);
    return response.data;
  },

  // Trip Activities
  addActivity: async (tripId, activityData) => {
    const response = await apiClient.post(`/trips/${tripId}/activities`, activityData);
    return response.data;
  },
  updateActivity: async (tripId, activityId, activityData) => {
    const response = await apiClient.patch(`/trips/${tripId}/activities/${activityId}`, activityData);
    return response.data;
  },
  deleteActivity: async (tripId, activityId) => {
    const response = await apiClient.delete(`/trips/${tripId}/activities/${activityId}`);
    return response.data;
  },

  // Expenses
  addExpense: async (tripId, expenseData) => {
    const response = await apiClient.post(`/trips/${tripId}/expenses`, expenseData);
    return response.data;
  },
  updateExpense: async (tripId, expenseId, expenseData) => {
    const response = await apiClient.patch(`/trips/${tripId}/expenses/${expenseId}`, expenseData);
    return response.data;
  },
  deleteExpense: async (tripId, expenseId) => {
    const response = await apiClient.delete(`/trips/${tripId}/expenses/${expenseId}`);
    return response.data;
  }
};
