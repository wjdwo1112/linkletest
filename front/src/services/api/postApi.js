import { get, post, put, del } from '../apiClient';

export const postApi = {
  // 게시글 목록 조회 (요약 정보)
  getPostList: async () => {
    return await get('/posts/summary');
  },

  // 게시글 상세 조회
  getPostDetail: async (postId) => {
    return await get(`/posts/${postId}`);
  },

  // 게시글 등록
  createPost: async (postData) => {
    try {
      const response = await post('/posts', postData);
      return response.data;
    } catch (error) {
      console.error('게시글 등록 실패:', error);
      throw new Error('게시글 등록에 실패했습니다.');
    }
  },

  // 게시글 수정
  updatePost: async (postId, postData) => {
    try {
      const response = await put(`/posts/${postId}`, postData);
      return response.data;
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      throw new Error('게시글 수정에 실패했습니다.');
    }
  },

  // 게시글 삭제
  deletePost: async (postId) => {
    try {
      const response = await del(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      throw new Error('게시글 삭제에 실패했습니다.');
    }
  },

  // 좋아요 토글
  toggleLike: async (postId) => {
    try {
      const response = await post(`/posts/${postId}/likes`, {});
      return response.data;
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      throw new Error('좋아요 처리에 실패했습니다.');
    }
  },

  // 좋아요 상태 조회
  getLikeStatus: async (postId) => {
    return await get(`/posts/${postId}/likes/status`);
  },
};
