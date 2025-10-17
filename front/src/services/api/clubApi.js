import { get } from '../apiClient';

export const clubApi = {
  // 내가 가입한 동호회 목록 조회
  getJoinedClubs: async () => {
    return await get('/clubs/joined');
  },

  // 동호회 생성
  createClub: async (data) => {
    const response = await post('/clubs', data);
    return response.data;
  },
};
