import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberApi } from '../../services/api';
import InterestsModal from './InterestsModal';

export default function MyPageProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await memberApi.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('프로필 조회 실패:', error);
      alert('프로필을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterestsUpdate = () => {
    fetchProfile();
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">로딩중...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">프로필을 불러올 수 없습니다.</div>
      </div>
    );
  }

  // const address = profile.sido && profile.sigungu ? `${profile.sido} ${profile.sigungu}` : '';

  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 rounded-full bg-gray-300 mb-6"></div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">{profile.nickname}</h2>

        {profile.description && (
          <>
            <p className="text-gray-600 mb-2">{profile.description}</p>
          </>
        )}

        {profile.interestNames && profile.interestNames.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {profile.interestNames.map((name, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm"
              >
                {name}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-4 w-full max-w-md">
          <button
            onClick={() => navigate('/mypage/profile/edit')}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            프로필 수정
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            관심사 설정
          </button>
        </div>
      </div>

      {isModalOpen && (
        <InterestsModal
          currentInterests={profile.interests || []}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleInterestsUpdate}
        />
      )}
    </div>
  );
}
