import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useUserStore from '../../store/useUserStore';

export default function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  useEffect(() => {
    const isNewUser = searchParams.get('isNewUser') === 'true';
    const memberId = searchParams.get('memberId');
    const email = searchParams.get('email');
    const name = searchParams.get('name');

    if (memberId) {
      setUser({
        id: parseInt(memberId),
        email: email,
        name: name,
      });

      if (isNewUser) {
        navigate('/signup/step2', { state: { memberId: parseInt(memberId) } });
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
