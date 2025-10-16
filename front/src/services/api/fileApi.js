import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 파일 업로드용 axios 인스턴스
const fileClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const fileApi = {
  // 이미지 업로드
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = sessionStorage.getItem('token');

    try {
      const response = await fileClient.post('/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      return response.data;
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw new Error('이미지 업로드에 실패했습니다.');
    }
  },

  // 이미지 삭제
  deleteImage: async (fileUrl) => {
    const token = sessionStorage.getItem('token');

    try {
      const response = await fileClient.delete('/file/delete', {
        params: { fileUrl },
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      return response.data;
    } catch (error) {
      console.error('이미지 삭제 실패:', error);
      throw new Error('이미지 삭제에 실패했습니다.');
    }
  },
};
