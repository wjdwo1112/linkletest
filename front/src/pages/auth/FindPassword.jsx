import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api';

export default function FindPassword() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({});
    }
    setIsEmailSent(false);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setErrors({ email: '이메일을 입력해주세요.' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: '올바른 이메일 형식이 아닙니다.' });
      return;
    }

    setIsLoading(true);

    try {
      await authApi.forgotPassword(email);
      setIsEmailSent(true);
      setErrors({});
    } catch (error) {
      console.error('비밀번호 찾기 에러:', error);
      setErrors({ email: error.message || '비밀번호 찾기에 실패했습니다.' });
      setIsEmailSent(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-6">
        <Link to="/login" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <span className="mr-2">←</span>
          <span className="text-sm">로그인으로 돌아가기</span>
        </Link>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">비밀번호 찾기</h2>
        <p className="text-gray-500 text-sm">가입 시 사용한 이메일을 입력해주세요</p>
      </div>

      {isEmailSent ? (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 mb-2">이메일을 확인해주세요</p>
            <p className="text-sm text-gray-600 mb-1">{email}로</p>
            <p className="text-sm text-gray-600">비밀번호 재설정 링크를 보내드렸습니다.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="mb-2">이메일이 도착하지 않았나요?</p>
            <ul className="text-left space-y-1 list-disc list-inside">
              <li>스팸 메일함을 확인해주세요</li>
              <li>입력하신 이메일 주소가 정확한지 확인해주세요</li>
              <li>링크는 24시간 동안 유효합니다</li>
            </ul>
          </div>
          <Link
            to="/login"
            className="block w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이메일 주소</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleInputChange}
              placeholder="example@linkle.com"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <span className="mr-1">✕</span>
                {errors.email}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '처리 중...' : '비밀번호 재설정 이메일 받기'}
          </button>

          <div className="text-center text-xs text-gray-500 py-2 space-x-2">
            <Link to="/signup" className="hover:underline">
              회원가입
            </Link>
            <span>|</span>
            <Link to="/find-id" className="hover:underline">
              아이디 찾기
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
