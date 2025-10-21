import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useUserStore from '../../store/useUserStore';
import { memberApi } from '../../services/api';

export default function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  useEffect(() => {
    const handleOAuth2Callback = async () => {
      const isNewUser = searchParams.get('isNewUser') === 'true';
      const memberId = searchParams.get('memberId');
      const email = searchParams.get('email');
      const name = searchParams.get('name');

      if (memberId) {
        const profile = await memberApi.getProfile();
        let profileImageUrl = '';
        if (profile.fileId) {
          try {
            const fileData = await fileApi.getFile(profile.fileId);
            profileImageUrl = fileData.fileLink || '';
          } catch (error) {
            console.error('프로필 이미지 조회 실패:', error);
          }
        }
        setUser({
          id: parseInt(memberId),
          email: email,
          name: name,
          fileId: profile.fileId,
          profileImageUrl: profileImageUrl,
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
    };
    handleOAuth2Callback();
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
