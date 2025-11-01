import { useEffect, useState } from 'react';
import { clubApi } from '../../../../services/api/clubApi';

const ClubInfo = ({ clubId, onDataLoad }) => {
  const [club, setClub] = useState(null);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clubData, count] = await Promise.all([
          clubApi.getClubDetail(clubId),
          clubApi.getClubMemberCount(clubId),
        ]);
        setClub(clubData);
        setMemberCount(count);

        if (onDataLoad) {
          onDataLoad(clubData);
        }
      } catch (error) {
        console.error('동호회 정보 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clubId, onDataLoad]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-gray-500">동호회 정보를 불러올 수 없습니다</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">동호회 정보</h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">동호회명</span>
          <span className="font-medium text-gray-900">{club.clubName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">카테고리</span>
          <span className="font-medium text-gray-900">{club.categoryName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">지역</span>
          <span className="font-medium text-gray-900">{club.region}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">회원 수</span>
          <span className="font-medium text-gray-900">
            {memberCount}명 / {club.maxMembers}명
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">개설일</span>
          <span className="font-medium text-gray-900">
            {club.openedAt ? new Date(club.openedAt).toLocaleDateString() : '-'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClubInfo;
