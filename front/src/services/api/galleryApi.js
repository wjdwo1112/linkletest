import { get, post, del } from '../apiClient';

export const galleryApi = {
  // 갤러리 목록 조회 (동호회 필터링 가능)
  getGalleryList: async (clubId) => {
    const params = clubId ? { clubId } : {};
    return await get('/gallery/list', { params });
  },

  // 갤러리 상세 조회
  getGallery: async (galleryId) => {
    return await get(`/gallery/${galleryId}`);
  },

  // 갤러리 등록
  createGallery: async (data) => {
    const response = await post('/gallery', data);
    return response.data;
  },

  // 갤러리 삭제
  deleteGallery: async (galleryId) => {
    const response = await del(`/gallery/${galleryId}`);
    return response.data;
  },

  // 갤러리 좋아요 토글
  toggleGalleryLike: async (galleryId) => {
    const response = await post(`/gallery/${galleryId}/likes`);
    return response.data;
  },

  // 갤러리 좋아요 상태 조회
  getGalleryLikeStatus: async (galleryId) => {
    return await get(`/gallery/${galleryId}/likes/status`);
  },
};
