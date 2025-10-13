// front/src/services/api/postApi.js
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
    const response = await post('/posts', postData);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('게시글 등록 실패 응답:', errorText);
      throw new Error('게시글 등록에 실패했습니다.');
    }

    // 201 Created 상태면 성공
    return response;
  },

  // 게시글 수정
  updatePost: async (postId, postData) => {
    const response = await put(`/posts/${postId}`, postData);

    if (!response.ok) {
      throw new Error('게시글 수정에 실패했습니다.');
    }

    return await response.json();
  },

  // 게시글 삭제
  deletePost: async (postId) => {
    const response = await del(`/posts/${postId}`);

    if (!response.ok) {
      throw new Error('게시글 삭제에 실패했습니다.');
    }

    return response;
  },

  // 좋아요 토글
  toggleLike: async (postId) => {
    const response = await post(`/posts/${postId}/likes`, {});

    if (!response.ok) {
      throw new Error('좋아요 처리에 실패했습니다.');
    }

    return await response.json();
  },

  // 좋아요 상태 조회
  getLikeStatus: async (postId) => {
    return await get(`/posts/${postId}/likes/status`);
  },
};
