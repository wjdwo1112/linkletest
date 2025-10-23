import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clubApi } from '../../services/api/clubApi';
import { scheduleApi } from '../../services/api/scheduleApi';

const ClubDetailNew = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClubDetail();
    fetchSchedules();
    fetchMemberCount();
    fetchMembers();
  }, [clubId]);

  const fetchClubDetail = async () => {
    try {
      const data = await clubApi.getClubDetail(clubId);
      setClub(data);
    } catch (error) {
      console.error('동호회 정보를 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const data = await scheduleApi.getSchedulesByClubId(clubId);
      setSchedules(data);
    } catch (error) {
      console.error('일정 정보를 불러오는데 실패했습니다:', error);
    }
  };

  const fetchMemberCount = async () => {
    try {
      const count = await clubApi.getClubMemberCount(clubId);
      setMemberCount(count);
    } catch (error) {
      console.error('회원 수를 불러오는데 실패했습니다:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const data = await clubApi.getClubMembers(clubId);
      setMembers(data);
    } catch (error) {
      console.error('회원 목록을 불러오는데 실패했습니다:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">동호회 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 상단 이미지 섹션 */}
      <div className="mb-6">
        <img
          src={club.fileLink || 'https://via.placeholder.com/800x200/cccccc/666666?text=Club+Image'}
          alt={club.clubName}
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex gap-8">
        {/* 왼쪽 영역 - 동호회 정보 */}
        <div className="flex-1">
          {/* 동호회 썸네일 & 이름 */}
          <div className="flex items-start gap-4 mb-6">
            <img
              src={club.fileLink || 'https://via.placeholder.com/80/cccccc/666666?text=Logo'}
              alt={club.clubName}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{club.clubName}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{club.categoryName}</span>
                <span>•</span>
                <span>개설일 {formatDate(club.openedAt)}</span>
              </div>
            </div>
          </div>

          {/* 모임 소개 */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-blue-500">💡</span>
              <h2 className="font-bold">모임 소개</h2>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{club.description}</p>
            <div className="mt-4 text-sm text-gray-600">
              <p>개설일: {club.openedAt ? new Date(club.openedAt).toLocaleDateString() : ''}</p>
            </div>
          </div>

          {/* 운영진 섹션 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">👥 운영진</h2>
              <button className="text-sm text-gray-500">더보기 &gt;</button>
            </div>
            <div className="flex gap-4">
              {members
                .filter((m) => m.role === 'LEADER' || m.role === 'MANAGER')
                .slice(0, 3)
                .map((member) => (
                  <div key={member.memberId} className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden mb-2">
                      <img
                        src={
                          member.fileLink ||
                          'https://via.placeholder.com/64/cccccc/666666?text=User'
                        }
                        alt={member.nickname}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium">{member.nickname}</span>
                    {member.role === 'LEADER' && (
                      <span className="text-xs text-blue-500 mt-1">⭐ 리더</span>
                    )}
                    {member.role === 'MANAGER' && (
                      <span className="text-xs text-blue-500 mt-1">운영진</span>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* 모임 멤버 섹션 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                👥 모임 멤버 {memberCount}
              </h2>
              <button className="text-sm text-gray-500">더보기 &gt;</button>
            </div>
            <div className="grid grid-cols-6 gap-4">
              {members.slice(0, 30).map((member) => (
                <div key={member.memberId} className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden mb-1">
                    <img
                      src={
                        member.fileLink || 'https://via.placeholder.com/56/cccccc/666666?text=User'
                      }
                      alt={member.nickname}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-center truncate w-full">{member.nickname}</span>
                  {member.role === 'LEADER' && (
                    <span className="text-xs" style={{ color: '#4CA8FF' }}>
                      ⭐
                    </span>
                  )}
                  {member.role === 'MANAGER' && (
                    <span className="text-xs" style={{ color: '#4CA8FF' }}>
                      🔰
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽 영역 - 동호회 정보 & 일정 */}
        <div className="w-80">
          {/* 동호회 정보 카드 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
            <h3 className="font-bold mb-4">{club.clubName}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">{club.categoryName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">멤버 {memberCount}명</span>
              </div>
            </div>
            <button
              className="w-full mt-4 py-3 rounded-lg font-medium text-white"
              style={{ backgroundColor: '#4CA8FF' }}
            >
              가입하기
            </button>
          </div>

          {/* 정보 일정 섹션 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold mb-4">정보 일정</h3>
            <div className="space-y-3">
              {schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <div
                    key={schedule.scheduleId}
                    className="flex items-start gap-3 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition"
                  >
                    <div className="w-12 h-12 bg-red-500 rounded flex flex-col items-center justify-center text-white flex-shrink-0">
                      <span className="text-xs">
                        {formatDate(schedule.scheduleStartDate).split('월')[0]}월
                      </span>
                      <span className="text-lg font-bold">
                        {formatDate(schedule.scheduleStartDate).split(' ')[1].replace('일', '')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{schedule.title}</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>⏰ {formatTime(schedule.scheduleStartDate)}</p>
                        <p>📍 {schedule.address}</p>
                        <p>
                          👥 {schedule.attendeeCount || 0}/{schedule.maxAttendees}명
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">예정된 일정이 없습니다</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetailNew;
