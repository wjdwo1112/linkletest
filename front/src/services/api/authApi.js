import { post, get } from '../apiClient';

export const authApi = {
  // 로그인
  login: async (email, password) => {
    try {
      const response = await post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || '로그인에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 회원가입 1단계
  registerStep1: async (email, password, name) => {
    try {
      const response = await post('/auth/register/step1', { email, password, name });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || '회원가입에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 회원가입 2단계
  registerStep2: async (memberId, nickname, birthDate, gender, sido, sigungu) => {
    try {
      const response = await post('/auth/register/step2', {
        memberId,
        nickname,
        birthDate,
        gender,
        sido,
        sigungu,
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || '회원 정보 등록에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 회원가입 3단계
  registerStep3: async (memberId, interests) => {
    try {
      const response = await post('/auth/register/step3', {
        memberId,
        interests,
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || '관심사 등록에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 이메일 인증
  verifyEmail: async (token) => {
    return await get(`/auth/email/verify?token=${encodeURIComponent(token)}`);
  },

  // 닉네임 중복 체크
  checkNickname: async (nickname) => {
    const isDuplicate = await get(
      `/member/check-nickname?nickname=${encodeURIComponent(nickname)}`,
    );
    return isDuplicate;
  },

  // 아이디 찾기
  findId: async (email) => {
    try {
      const response = await post('/auth/find-id', { email });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || '등록된 이메일을 찾을 수 없습니다.';
      throw new Error(errorMessage);
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      const response = await post('/auth/logout', {});
      return response.data;
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  },

  // 토큰 갱신
  refreshToken: async (refreshToken) => {
    try {
      const response = await post('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      throw new Error('토큰 갱신에 실패했습니다.');
    }
  },
};
