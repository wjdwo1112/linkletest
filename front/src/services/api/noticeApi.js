import { get, post, put, del } from '../apiClient';

export const noticeApi = {
  // 고정 공지사항 목록 조회
  getPinned: async () => {
    return await get('/notices/ispinned');
  },

  // 전체 공지사항 목록 조회
  getNoticeList: async () => {
    return await get('/notices/list');
  },

  // 특정 동호회의 공지사항 목록 조회
  getNoticesByClubId: async (clubId) => {
    return await get(`/notices/club/${clubId}`);
  },

  // 공지사항 상세 조회
  getNoticeDetail: async (postId) => {
    return await get(`/notices/${postId}`);
  },

  // 공지사항 등록
  createNotice: async (noticeData) => {
    try {
      const response = await post('/notices', noticeData);
      return response.data;
    } catch (error) {
      console.error('공지사항 등록 실패:', error);
      throw new Error('공지사항 등록에 실패했습니다.');
    }
  },

  // 공지사항 수정
  updateNotice: async (postId, noticeData) => {
    try {
      const response = await put(`/notices/${postId}`, noticeData);
      return response.data;
    } catch (error) {
      console.error('공지사항 수정 실패:', error);
      throw new Error('공지사항 수정에 실패했습니다.');
    }
  },

  // 공지사항 삭제
  deleteNotice: async (postId) => {
    try {
      const response = await del(`/notices/${postId}`);
      return response.data;
    } catch (error) {
      console.error('공지사항 삭제 실패:', error);
      throw new Error('공지사항 삭제에 실패했습니다.');
    }
  },

  // 공지사항 고정/해제 토글
  togglePin: async (postId) => {
    try {
      const response = await put(`/notices/${postId}/pin`, {});
      return response.data;
    } catch (error) {
      console.error('고정 상태 변경 실패:', error);
      throw new Error('고정 상태 변경에 실패했습니다.');
    }
  },
};
