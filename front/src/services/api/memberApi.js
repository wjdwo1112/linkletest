import { get, put, del } from '../apiClient';

export const memberApi = {
  getProfile: async () => {
    return await get('/member/profile');
  },

  updateProfile: async (data) => {
    return await put('/member/profile', data);
  },

  updateInterests: async (interests) => {
    return await put('/member/interests', { interests });
  },

  checkNickname: async (nickname) => {
    return await get(`/member/check-nickname?nickname=${encodeURIComponent(nickname)}`);
  },

  updatePassword: async (currentPassword, newPassword) => {
    const response = await put('/member/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  withdrawAccount: async (password) => {
    const response = await del('/member/withdrawal', password ? { password } : {});
    return response.data;
  },
};
