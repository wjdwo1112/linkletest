import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 자동 전송
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    console.error('API 요청 에러:', error);
    return Promise.reject(error);
  },
);

// GET 요청
export const get = async (url) => {
  const response = await apiClient.get(url);
  return response.data;
};

// POST 요청
export const post = async (url, data) => {
  const response = await apiClient.post(url, data);
  return response;
};

// PUT 요청
export const put = async (url, data) => {
  const response = await apiClient.put(url, data);
  return response;
};

// DELETE 요청
export const del = async (url) => {
  const response = await apiClient.delete(url);
  return response;
};

export default {
  get,
  post,
  put,
  del,
};
