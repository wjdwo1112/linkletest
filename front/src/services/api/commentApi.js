// front/src/services/api/commentApi.js
import { get, post, put, del } from '../apiClient';

export const commentApi = {
  // 게시글의 댓글 목록 조회
  getComments: async (postId) => {
    return await get(`/posts/${postId}/comments`);
  },

  // 댓글 등록
  createComment: async (postId, commentData) => {
    const response = await post(`/posts/${postId}/comments`, commentData);

    if (!response.ok) {
      throw new Error('댓글 등록에 실패했습니다.');
    }

    return response;
  },

  // 댓글 수정
  updateComment: async (commentId, content) => {
    const response = await put(`/comments/${commentId}`, { content });

    if (!response.ok) {
      throw new Error('댓글 수정에 실패했습니다.');
    }

    return response;
  },

  // 댓글 삭제
  deleteComment: async (commentId) => {
    const response = await del(`/comments/${commentId}`);

    if (!response.ok) {
      throw new Error('댓글 삭제에 실패했습니다.');
    }

    return response;
  },
};
