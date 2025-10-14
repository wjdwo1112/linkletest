import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api';

export default function FindId() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [foundEmail, setFoundEmail] = useState(null);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({});
    }
    setFoundEmail(null);
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
      const response = await authApi.findId(email);
      setFoundEmail(response.email);
      setErrors({});
    } catch (error) {
      console.error('아이디 찾기 에러:', error);
      setErrors({ email: error.message || '아이디 찾기에 실패했습니다.' });
      setFoundEmail(null);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">아이디 찾기</h2>
        <p className="text-gray-500 text-sm">가입 시 사용한 이메일을 입력해주세요</p>
      </div>

      {foundEmail ? (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">✓</span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">회원님의 아이디는</p>
            <p className="text-xl font-bold text-gray-900">{foundEmail}</p>
            <p className="text-sm text-gray-600 mt-2">입니다.</p>
          </div>
          <div className="flex gap-3 pt-4">
            <Link
              to="/login"
              className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center"
            >
              로그인
            </Link>
            <Link
              to="/find-password"
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              비밀번호 찾기
            </Link>
          </div>
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
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
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
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <span className="mr-2">🔍</span>
            {isLoading ? '처리 중...' : '아이디 찾기'}
          </button>

          <div className="text-center text-xs text-gray-500 py-2 space-x-2">
            <Link to="/signup" className="hover:underline">
              회원가입
            </Link>
            <span>|</span>
            <Link to="/find-password" className="hover:underline">
              비밀번호 찾기
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
