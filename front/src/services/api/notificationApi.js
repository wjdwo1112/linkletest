import { get, put, del } from '../apiClient';

export const notificationApi = {
  getNotifications: async () => {
    return await get('/notifications');
  },

  markAsRead: async (notificationId) => {
    await put(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async () => {
    await put('/notifications/read-all');
  },

  deleteNotification: async (notificationId) => {
    await del(`/notifications/${notificationId}`);
  },
};
