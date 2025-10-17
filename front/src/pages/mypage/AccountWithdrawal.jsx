import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberApi } from '../../services/api';
import useUserStore from '../../store/useUserStore';

export default function AccountWithdrawal() {
  const navigate = useNavigate();
  const { clearUser } = useUserStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  useEffect(() => {
    checkUserType();
  }, []);

  const checkUserType = async () => {
    try {
      const profile = await memberApi.getProfile();
      setShowPasswordInput(!profile.provider || profile.provider === 'LOCAL');
    } catch (error) {
      console.error('프로필 조회 실패:', error);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (showPasswordInput && !password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    const confirmed = window.confirm(
      '정말로 탈퇴하시겠습니까? 탈퇴 후에는 계정 복구가 불가능합니다.',
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);

    try {
      await memberApi.withdrawAccount(showPasswordInput ? password : null);
      clearUser();
      navigate('/');
    } catch (error) {
      console.error('회원 탈퇴 실패:', error);
      setError(error.message || '회원 탈퇴에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/mypage/profile');
  };

  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
      <h1 className="text-2xl font-bold mb-8">회원 탈퇴</h1>

      <div className="max-w-3xl">
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">탈퇴 전, 안내 사항</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <ul className="space-y-2 text-sm text-gray-700">
              <li>1. 계정 탈퇴 시, 현재 가입 중인 모든 동호회에서도 자동으로 탈퇴 처리됩니다.</li>
              <li>
                2. 탈퇴와 함께 계정과 관련된 모든 권한(동호회 참여, 게시물 작성 권한 등)이 사라지며,
                복구가 불가능합니다.
              </li>
              <li>
                3. 작성 작성하신 콘텐츠(게시물, 댓글, 사진 등)는 자동으로 삭제되지 않으며, 탈퇴
                이전에 직접 삭제하셔야 합니다.
              </li>
              <li>
                4. 탈퇴 후 동일한 이메일로 계약일은 가능하지만, 기존 계정으로 연동되지 않습니다.
              </li>
              <li>
                5. 연동된 소셜 로그인 계정 정도 함께 삭제되며, 기존 계정으로 소셜 로그인을 이용하실
                수 없습니다.
              </li>
              <li>
                6. 현재 비밀번호를 입력하고 탈퇴하기를 누르시면 탈퇴 내용이 등록한 것으로
                간주됩니다.
              </li>
            </ul>
          </div>
        </div>

        {showPasswordInput && (
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">비밀번호</h2>
              <p className="text-sm text-gray-600 mb-4">
                본인 확인을 위해 현재 계정의 비밀번호를 입력해주세요.
              </p>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="현재 비밀번호"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '처리중...' : '탈퇴하기'}
              </button>
            </div>
          </form>
        )}

        {!showPasswordInput && (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '처리중...' : '탈퇴하기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
