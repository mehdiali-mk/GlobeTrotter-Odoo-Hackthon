import apiClient from './apiClient';

export const expenseService = {
  getExpenses: async (tripId, queryParams = '') => {
    const response = await apiClient.get(`/trips/${tripId}/expenses${queryParams}`);
    return response.data;
  },

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
  },
};
