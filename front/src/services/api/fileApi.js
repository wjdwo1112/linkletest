import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 파일 업로드용 axios 인스턴스
const fileClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키 자동 전송
});

export const fileApi = {
  // 이미지 업로드 - fileId와 URL 반환
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fileClient.post('/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // response.data는 { fileId, fileUrl, originalFileName } 형태
      return response.data;
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw new Error('이미지 업로드에 실패했습니다.');
    }
  },

  // 파일 정보 조회
  getFile: async (fileId) => {
    try {
      const response = await fileClient.get(`/file/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('파일 조회 실패:', error);
      throw new Error('파일 조회에 실패했습니다.');
    }
  },

  // 여러 파일 정보 조회
  getFiles: async (fileIds) => {
    if (!fileIds || fileIds.length === 0) return [];

    try {
      // 각 fileId에 대해 조회
      const promises = fileIds.map((fileId) => fileClient.get(`/file/${fileId}`));

      const responses = await Promise.all(promises);
      return responses.map((res) => res.data);
    } catch (error) {
      console.error('파일 목록 조회 실패:', error);
      throw new Error('파일 목록 조회에 실패했습니다.');
    }
  },

  // 이미지 삭제 (fileId로 삭제)
  deleteImage: async (fileId) => {
    try {
      const response = await fileClient.delete(`/file/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('이미지 삭제 실패:', error);
      throw new Error('이미지 삭제에 실패했습니다.');
    }
  },
};
