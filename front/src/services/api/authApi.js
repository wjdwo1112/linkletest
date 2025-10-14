import { post, get } from '../apiClient';

export const authApi = {
  // 로그인
  login: async (email, password) => {
    const response = await post('/auth/login', { email, password });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || '로그인에 실패했습니다.');
    }

    return await response.json();
  },

  // 회원가입 1단계
  registerStep1: async (email, password, name) => {
    const response = await post('/auth/register/step1', { email, password, name });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '회원가입에 실패했습니다.');
    }

    return await response.json();
  },

  // 회원가입 2단계
  registerStep2: async (memberId, nickname, birthDate, gender, sido, sigungu) => {
    const response = await post('/auth/register/step2', {
      memberId,
      nickname,
      birthDate,
      gender,
      sido,
      sigungu,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '회원 정보 등록에 실패했습니다.');
    }

    return await response.json();
  },

  // 회원가입 3단계
  registerStep3: async (memberId, interests) => {
    const response = await post('/auth/register/step3', {
      memberId,
      interests,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '관심사 등록에 실패했습니다.');
    }

    return await response.json();
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
    const response = await post('/auth/find-id', { email });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '등록된 이메일을 찾을 수 없습니다.');
    }

    return await response.json();
  },

  // 로그아웃
  logout: async () => {
    await post('/auth/logout', {});
  },

  // 토큰 갱신
  refreshToken: async (refreshToken) => {
    const response = await post('/auth/refresh', { refreshToken });

    if (!response.ok) {
      throw new Error('토큰 갱신에 실패했습니다.');
    }

    return await response.json();
  },
};
