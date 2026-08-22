import apiClient from './apiClient';

export const userService = {
  getMe: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  updateMe: async (userData) => {
    const response = await apiClient.patch('/users/updateMe', userData);
    return response.data;
  },

  deleteMe: async () => {
    const response = await apiClient.delete('/users/deleteMe');
    return response.data;
  }
};
