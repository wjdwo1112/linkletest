import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../services/api';

export default function RegisterStep2() {
  const navigate = useNavigate();
  const location = useLocation();
  const memberId = location.state?.memberId;

  const [formData, setFormData] = useState({
    nickname: '',
    birthDate: '',
    gender: '',
    sido: '',
    sigungu: '',
  });

  const [errors, setErrors] = useState({});
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(false);

  useEffect(() => {
    if (!memberId) {
      alert('잘못된 접근입니다.');
      navigate('/signup');
    }
  }, [memberId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 닉네임 변경 시 중복 체크 초기화
    if (name === 'nickname') {
      setNicknameChecked(false);
      setNicknameAvailable(false);
    }

    // 에러 제거
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNicknameCheck = async () => {
    if (!formData.nickname) {
      setErrors((prev) => ({ ...prev, nickname: '닉네임을 입력해주세요.' }));
      return;
    }

    try {
      const isDuplicate = await authApi.checkNickname(formData.nickname);
      setNicknameChecked(true);

      if (isDuplicate) {
        setNicknameAvailable(false);
        setErrors((prev) => ({ ...prev, nickname: '이미 사용 중인 닉네임입니다.' }));
      } else {
        setNicknameAvailable(true);
        setErrors((prev) => ({ ...prev, nickname: '' }));
      }
    } catch (error) {
      console.error('닉네임 중복 체크 에러:', error);
      alert('닉네임 중복 체크에 실패했습니다.');
    }
  };

  const openAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setFormData((prev) => ({
          ...prev,
          sido: data.sido,
          sigungu: data.sigungu,
        }));
      },
    }).open();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nickname) {
      newErrors.nickname = '닉네임을 입력해주세요.';
    } else if (!nicknameChecked || !nicknameAvailable) {
      newErrors.nickname = '닉네임 중복 확인이 필요합니다.';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = '생년월일을 입력해주세요.';
    }

    if (!formData.gender) {
      newErrors.gender = '성별을 선택해주세요.';
    }

    if (!formData.sido || !formData.sigungu) {
      newErrors.address = '주소를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await authApi.registerStep2(
        memberId,
        formData.nickname,
        formData.birthDate,
        formData.gender,
        formData.sido,
        formData.sigungu,
      );

      console.log('2단계 완료:', response);
      navigate('/signup/step3', { state: { memberId } });
    } catch (error) {
      console.error('2단계 에러:', error);
      alert(error.message || '회원 정보 등록에 실패했습니다.');
    }
  };

  const handlePrevious = () => {
    navigate('/signup');
  };

  return (
    <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
      {/* 단계 표시 */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
            1
          </div>
          <div className="w-12 h-0.5 bg-primary mx-2"></div>
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
            2
          </div>
          <div className="w-12 h-0.5 bg-gray-300 mx-2"></div>
          <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
            3
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">추가 정보</h1>
        <p className="text-gray-500 text-sm">서비스 이용을 위한 추가 정보를 입력해주세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 닉네임 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">닉네임</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              placeholder="닉네임"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleNicknameCheck}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              중복확인
            </button>
          </div>
          {nicknameChecked && nicknameAvailable && (
            <p className="mt-1 text-sm text-green-500 flex items-center">
              <span className="mr-1">✓</span>
              사용 가능한 닉네임입니다.
            </p>
          )}
          {errors.nickname && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <span className="mr-1">✕</span>
              {errors.nickname}
            </p>
          )}
        </div>

        {/* 생년월일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">생년월일</label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.birthDate && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <span className="mr-1">✕</span>
              {errors.birthDate}
            </p>
          )}
        </div>

        {/* 성별 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="M"
                checked={formData.gender === 'M'}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-gray-700">남성</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="F"
                checked={formData.gender === 'F'}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-gray-700">여성</span>
            </label>
          </div>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <span className="mr-1">✕</span>
              {errors.gender}
            </p>
          )}
        </div>

        {/* 주소 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={
                formData.sido && formData.sigungu ? `${formData.sido} ${formData.sigungu}` : ''
              }
              placeholder="주소를 검색해주세요"
              readOnly
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer"
              onClick={openAddressSearch}
            />
            <button
              type="button"
              onClick={openAddressSearch}
              className="px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors whitespace-nowrap"
            >
              주소검색
            </button>
          </div>
          {errors.address && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <span className="mr-1">✕</span>
              {errors.address}
            </p>
          )}
        </div>

        {/* 버튼 그룹 */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={handlePrevious}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            이전
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
          >
            다음
          </button>
        </div>
      </form>
    </div>
  );
}
