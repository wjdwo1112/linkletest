import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useUserStore from '../../store/useUserStore';

export default function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const isNewUser = searchParams.get('isNewUser') === 'true';
    const memberId = searchParams.get('memberId');
    const email = searchParams.get('email');
    const name = searchParams.get('name');

    if (accessToken && refreshToken) {
      // 토큰 저장
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // 사용자 정보 저장
      setUser({
        id: parseInt(memberId),
        email: email,
        name: name,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });

      // 신규 사용자면 추가 정보 입력 페이지로, 기존 사용자면 홈으로
      if (isNewUser) {
        // 향후 구현 예정: 2단계 회원가입 페이지로 이동
        // navigate('/signup/step2');
        console.log('신규 사용자 - 추가 정보 입력 페이지로 이동 예정');
        navigate('/');
      } else {
        navigate('/');
      }
    } else {
      // 로그인 실패
      console.error('OAuth2 로그인 실패');
      navigate('/login?error=true');
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#4CA8FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
}
