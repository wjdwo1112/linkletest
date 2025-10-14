import { useNavigate, useLocation } from 'react-router-dom';

export default function RegisterComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-primary"
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

          <h2 className="text-2xl font-bold text-gray-900 mb-2">회원가입 완료</h2>
          <p className="text-gray-600 mb-6">
            {email ? (
              <>
                <span className="font-medium text-primary">{email}</span>
                <br />로 인증 메일을 발송했습니다.
              </>
            ) : (
              '인증 메일을 발송했습니다.'
            )}
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 mb-2">인증 방법</h3>
            <ol className="text-sm text-gray-600 space-y-2">
              <li>1. 이메일을 확인해주세요</li>
              <li>2. 인증 메일의 버튼을 클릭해주세요</li>
              <li>3. 인증 완료 후 로그인해주세요</li>
            </ol>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            메일이 오지 않았다면 스팸 메일함을 확인해주세요.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            로그인 페이지로
          </button>
        </div>
      </div>
    </div>
  );
}
