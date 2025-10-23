import { get, put, del } from '../apiClient';

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

  // 동호회 상세 정보 조회
  getClubDetail: async (clubId) => {
    return await get(`/clubs/${clubId}`);
  },

  // 동호회 수정
  updateClub: async (clubId, data) => {
    return await put(`/clubs/${clubId}`, data);
  },

  // 동호회 삭제
  deleteClub: async (clubId) => {
    return await del(`/clubs/${clubId}`);
  },

  // 동호회 회원 수 조회
  getClubMemberCount: async (clubId) => {
    return await get(`/clubs/${clubId}/member-count`);
  },

  // 동호회 회원 목록 조회
  getClubMembers: async (clubId) => {
    return await get(`/clubs/${clubId}/members`);
  },
};
