import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {ㅞ
      window.location.href = '/login';
      return Promise.reject(new Error('인증이 만료되었습니다.'));
    }

    const errorMessage = error.response?.data?.message || error.message || '요청에 실패했습니다.';
    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    customError.response = error.response;

    console.error('API 요청 에러:', {
      status: error.response?.status,
      message: errorMessage,
      url: error.config?.url,
    });

    return Promise.reject(customError);
  },
);

export const apiRequest = async (url, options = {}) => {
  return await apiClient({
    url,
    ...options,
  });
};

// export const get = async (url) => {
//   const response = await apiClient.get(url);
//   return response.data;
// };

// config 옵션을 받도록 수정
export const get = async (url, config = {}) => {
  const response = await apiClient.get(url, config);
  return response.data;
};

export const post = async (url, data) => {
  const response = await apiClient.post(url, data);
  return response;
};

export const put = async (url, data) => {
  const response = await apiClient.put(url, data);
  return response;
};

export const del = async (url, data) => {
  const response = await apiClient.delete(url, { data });
  return response;
};

export default {
  get,
  post,
  put,
  del,
};
