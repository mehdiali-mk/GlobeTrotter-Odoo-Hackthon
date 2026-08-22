import apiClient from './apiClient';

export const communityService = {
  getAllPosts: async (queryParams = '') => {
    const response = await apiClient.get(`/community${queryParams}`);
    return response.data;
  },

  getPost: async (id) => {
    const response = await apiClient.get(`/community/${id}`);
    return response.data;
  },

  createPost: async (postData) => {
    const response = await apiClient.post('/community', postData);
    return response.data;
  },

  updatePost: async (id, postData) => {
    const response = await apiClient.patch(`/community/${id}`, postData);
    return response.data;
  },

  deletePost: async (id) => {
    const response = await apiClient.delete(`/community/${id}`);
    return response.data;
  },

  // NOTE: Likes need a backend endpoint as per the gap analysis
};
