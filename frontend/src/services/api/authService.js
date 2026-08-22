import apiClient from './apiClient';

export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  signup: async (userData) => {
    const response = await apiClient.post('/auth/signup', userData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgotPassword', { email });
    return response.data;
  },

  resetPassword: async (token, password, passwordConfirm) => {
    const response = await apiClient.patch(`/auth/resetPassword/${token}`, {
      password,
      passwordConfirm,
    });
    return response.data;
  },
};
