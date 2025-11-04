import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clubMemberApi } from '../../../../services/api/clubMemberApi';

const ClubMembers = ({ clubId }) => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await clubMemberApi.getClubMembers(clubId);
        setMembers(result.slice(0, 6));
      } catch (error) {
        console.error('회원 목록 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clubId]);

  const handleViewAll = () => {
    navigate(`/clubs/${clubId}/members`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">동호회 회원</h2>
        <button onClick={handleViewAll} className="text-sm text-primary hover:underline">
          전체 보기
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">회원이 없습니다</div>
        ) : (
          members.map((member) => (
            <div key={member.memberId} className="flex items-center gap-3 px-1">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                {member.fileLink ? (
                  <img
                    src={member.fileLink}
                    alt={member.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg text-white font-medium">
                    {member.nickname?.[0] || '?'}
                  </span>
                )}
              </div>
              {/* 긴 닉네임 가로 유지 + 말줄임 */}
              <p className="text-sm font-medium text-gray-900 truncate flex-1">{member.nickname}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClubMembers;
