import { get, put, del, post } from '../apiClient';

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
    return await get(`/clubs/${clubId}/members/summary`);
  },
  // 가입 신청
  requestJoin: async (clubId) => {
    return await post(`/clubs/${clubId}/members/join`);
  },

  // 회원 상태 조회
  getMyMemberStatus: async (clubId) => {
    return await get(`/clubs/${clubId}/members/my-status`);
  },

  // 대시보드 통계 조회
  getMonthlyAttendance: async (clubId) => {
    return await get(`/clubs/${clubId}/dashboard/attendance`);
  },

  getAgeDistribution: async (clubId) => {
    return await get(`/clubs/${clubId}/dashboard/age`);
  },

  getGenderRatio: async (clubId) => {
    return await get(`/clubs/${clubId}/dashboard/gender`);
  },

  getQuarterlyJoinStats: async (clubId) => {
    return await get(`/clubs/${clubId}/dashboard/quarterly-join`);
  },

  // 동호회 검색
  searchClubs: async (keyword) => {
    return await get(`/clubs/search?keyword=${encodeURIComponent(keyword)}`);
  },

  // 최근 생성 동호회 조회 (메인용 - 3개)
  getRecentClubs: async () => {
    return await get('/clubs/recent');
  },

  // 최근 생성 동호회 조회 (더보기용 - 무한 스크롤)
  getRecentClubsAll: async (size = 10, cursor = null) => {
    const params = new URLSearchParams();
    params.append('size', size);
    if (cursor) {
      params.append('cursor', cursor);
    }
    return await get(`/clubs/recent/all?${params.toString()}`);
  },

  // 카테고리별 동호회 조회 (메인용 - 3개)
  getClubsByCategory: async (categoryId) => {
    return await get(`/clubs/category/${categoryId}`);
  },

  // 카테고리별 동호회 조회 (더보기용 - 무한 스크롤)
  getClubsByCategoryAll: async (categoryId, size = 10, cursor = null) => {
    const params = new URLSearchParams();
    params.append('size', size);
    if (cursor) {
      params.append('cursor', cursor);
    }
    return await get(`/clubs/category/${categoryId}/all?${params.toString()}`);
  },

  // 동호회 추천 - 카테고리 기반
  recommendByCategory: async () => {
    return await get('/clubs/recommend/category');
  },

  // 동호회 추천 - 지역 기반
  recommendByRegion: async () => {
    return await get('/clubs/recommend/region');
  },

  // 동호회 추천 - 복합
  recommendByCombined: async () => {
    return await get('/clubs/recommend/combined');
  },

  //동호회 탈퇴
  withdrawFromClub: async (clubId) => {
    return await del(`/clubs/${clubId}/members/withdraw`);
  },
};
