import apiClient from './apiClient';

export const itineraryService = {
  // Stops
  getStops: async (tripId) => {
    const response = await apiClient.get(`/trips/${tripId}/stops`);
    return response.data;
  },

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

  // Activities
  getActivities: async (tripId, queryParams = '') => {
    const response = await apiClient.get(`/trips/${tripId}/activities${queryParams}`);
    return response.data;
  },

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
};
