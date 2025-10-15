// front/src/services/api/fileApi.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fileApi = {
  // 이미지 업로드
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = sessionStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/file/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('이미지 업로드에 실패했습니다.');
    }

    return await response.text();
  },

  // 이미지 삭제
  deleteImage: async (fileUrl) => {
    const token = sessionStorage.getItem('token');

    const response = await fetch(
      `${API_BASE_URL}/file/delete?fileUrl=${encodeURIComponent(fileUrl)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error('이미지 삭제에 실패했습니다.');
    }

    return await response.text();
  },
};
