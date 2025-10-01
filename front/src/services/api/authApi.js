import { post } from '../apiClient';

export const authApi = {
  // 로그인
  login: async (email, password) => {
    const response = await post('/auth/login', { email, password });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || '로그인에 실패했습니다.');
    }

    return await response.json();
  },

  // 로그아웃 (로컬 토큰 삭제)
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  // 토큰 갱신
  refreshToken: async (refreshToken) => {
    const response = await post('/auth/refresh', { refreshToken });

    if (!response.ok) {
      throw new Error('토큰 갱신에 실패했습니다.');
    }

    return await response.json();
  },
};
