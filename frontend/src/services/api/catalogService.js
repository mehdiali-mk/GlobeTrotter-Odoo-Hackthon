import apiClient from './apiClient';

export const catalogService = {
  // Cities
  searchCities: async (queryParams = '') => {
    const response = await apiClient.get(`/cities${queryParams}`);
    return response.data;
  },

  getCity: async (id) => {
    const response = await apiClient.get(`/cities/${id}`);
    return response.data;
  },

  addCity: async (cityData) => {
    const response = await apiClient.post('/cities', cityData);
    return response.data;
  },

  updateCity: async (id, cityData) => {
    const response = await apiClient.patch(`/cities/${id}`, cityData);
    return response.data;
  },

  deleteCity: async (id) => {
    const response = await apiClient.delete(`/cities/${id}`);
    return response.data;
  },

  // Activities
  searchActivities: async (queryParams = '') => {
    const response = await apiClient.get(`/activity-catalog${queryParams}`);
    return response.data;
  },

  getCatalogActivity: async (id) => {
    const response = await apiClient.get(`/activity-catalog/${id}`);
    return response.data;
  },

  addCatalogActivity: async (activityData) => {
    const response = await apiClient.post('/activity-catalog', activityData);
    return response.data;
  },

  updateCatalogActivity: async (id, activityData) => {
    const response = await apiClient.patch(`/activity-catalog/${id}`, activityData);
    return response.data;
  },

  deleteCatalogActivity: async (id) => {
    const response = await apiClient.delete(`/activity-catalog/${id}`);
    return response.data;
  },
};
