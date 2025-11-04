import { get, post, put } from '../apiClient';

export const clubMemberApi = {
  // 동호회 회원 목록 조회
  getClubMembers: async (clubId) => {
    return await get(`/clubs/${clubId}/members`);
  },

  // 가입 신청 대기 목록 조회
  getWaitingMembers: async (clubId) => {
    return await get(`/clubs/${clubId}/members/waiting`);
  },

  // 회원 권한 변경
  updateMemberRole: async (clubId, data) => {
    return await put(`/clubs/${clubId}/members/role`, data);
  },

  // 회원 강제 탈퇴
  removeMember: async (clubId, data) => {
    return await put(`/clubs/${clubId}/members/remove`, data);
  },

  // 가입 신청 승인
  approveMember: async (clubId, data) => {
    return await post(`/clubs/${clubId}/members/approve`, data);
  },

  // 가입 신청 거절
  rejectMember: async (clubId, data) => {
    return await post(`/clubs/${clubId}/members/reject`, data);
  },

  // 대기자 수 조회
  getWaitingCount: async (clubId) => {
    return await get(`/clubs/${clubId}/members/waiting-count`);
  },
};
