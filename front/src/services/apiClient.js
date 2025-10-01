const API_BASE_URL = 'http://localhost:8080/api/v1';

// 공통 요청 헤더 생성
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('accessToken');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// 기본 fetch 함수
export const apiRequest = async (url, options = {}) => {
  const config = {
    headers: getHeaders(),
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);

    // 401 Unauthorized 처리
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      throw new Error('인증이 만료되었습니다.');
    }

    return response;
  } catch (error) {
    console.error('API 요청 에러:', error);
    throw error;
  }
};

// GET 요청
export const get = async (url) => {
  const response = await apiRequest(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('데이터를 가져올 수 없습니다.');
  }

  return await response.json();
};

// POST 요청
export const post = async (url, data) => {
  const response = await apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return response;
};

// PUT 요청
export const put = async (url, data) => {
  const response = await apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  return response;
};

// DELETE 요청
export const del = async (url) => {
  const response = await apiRequest(url, {
    method: 'DELETE',
  });

  return response;
};

export default {
  get,
  post,
  put,
  del,
};
