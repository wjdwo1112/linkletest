import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useUserStore from '../../store/useUserStore';
import { authApi } from '../../services/api';
import logo from '../../assets/images/logo.png';

export default function Login() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser, setLoading, setError } = useUserStore();

  useEffect(() => {
    const errorMessage = searchParams.get('message');
    if (errorMessage) {
      setErrors({ general: decodeURIComponent(errorMessage) });
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      const data = await authApi.login(formData.email, formData.password);

      setUser({
        id: data.memberId,
        email: data.email,
        name: data.name,
        nickname: data.nickname,
      });

      navigate('/');
    } catch (error) {
      console.error('로그인 에러:', error);
      setError(error.message);
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    window.location.href = import.meta.env.VITE_OAUTH2_KAKAO_URL;
  };

  return (
    <div className="w-full max-w-6xl grid grid-cols-2 gap-16">
      <div className="flex items-center justify-start">
        <Link to="/">
          <img
            src={logo}
            alt="Linkle 로고"
            className="w-80 h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
          />
        </Link>
      </div>

      <div className="flex justify-end">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">로그인</h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                {errors.general}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="이메일"
                className={`w-full h-12 px-4 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="비밀번호"
                className={`w-full h-12 px-4 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <span className="mr-1">✕</span>
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary text-white rounded-md font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>

            <div className="text-center text-xs text-gray-500 py-2 space-x-2">
              <Link to="/signup" className="hover:underline">
                회원가입
              </Link>
              <span>|</span>
              <Link to="/find-id" className="hover:underline">
                아이디 찾기
              </Link>
              <span>|</span>
              <Link to="/find-password" className="hover:underline">
                비밀번호 찾기
              </Link>
            </div>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-300" />
              <span className="px-3 text-sm text-gray-400">간편 로그인</span>
              <div className="flex-grow border-t border-gray-300" />
            </div>

            <button
              type="button"
              onClick={handleKakaoLogin}
              className="w-full h-14 bg-yellow-400 text-black rounded-md font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center"
              aria-label="카카오 로그인"
            >
              <div className="w-4 h-4 bg-gray-400 rounded-full mr-3" aria-hidden="true" />
              카카오 로그인
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
