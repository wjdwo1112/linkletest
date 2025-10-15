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
    const response = await post('/notices', noticeData);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('공지사항 등록 실패 응답:', errorText);
      throw new Error('공지사항 등록에 실패했습니다.');
    }

    return response;
  },

  // 공지사항 수정
  updateNotice: async (postId, noticeData) => {
    const response = await put(`/notices/${postId}`, noticeData);

    if (!response.ok) {
      throw new Error('공지사항 수정에 실패했습니다.');
    }

    return await response.json();
  },

  // 공지사항 삭제
  deleteNotice: async (postId) => {
    const response = await del(`/notices/${postId}`);

    if (!response.ok) {
      throw new Error('공지사항 삭제에 실패했습니다.');
    }

    return response;
  },
};
