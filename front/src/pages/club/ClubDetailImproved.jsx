import React, { useState, useEffect } from 'react';
import { clubApi, scheduleApi } from './clubApi';

const ClubDetail = ({ clubId }) => {
  const [clubData, setClubData] = useState(null);
  const [members, setMembers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClubData();
  }, [clubId]);

  useEffect(() => {
    if (activeTab === 'members') {
      loadManagers();
    } else if (activeTab === 'allMembers') {
      loadMembers();
    }
  }, [activeTab, clubId]);

  const loadClubData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [clubResponse, schedulesResponse] = await Promise.all([
        clubApi.getClubDetail(clubId),
        clubApi.getClubSchedules(clubId, { limit: 3 })
      ]);
      
      setClubData(clubResponse);
      setSchedules(schedulesResponse);
    } catch (err) {
      console.error('동호회 정보 조회 실패:', err);
      setError('동호회 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const response = await clubApi.getClubMembers(clubId, { page: 1, size: 30 });
      setMembers(response);
    } catch (err) {
      console.error('멤버 목록 조회 실패:', err);
    }
  };

  const loadManagers = async () => {
    try {
      const response = await clubApi.getClubManagers(clubId);
      setManagers(response);
    } catch (err) {
      console.error('운영진 조회 실패:', err);
    }
  };

  const handleJoinClub = async () => {
    try {
      await clubApi.joinClub(clubId);
      alert('동호회 가입 신청이 완료되었습니다.');
      loadClubData();
    } catch (err) {
      console.error('가입 신청 실패:', err);
      alert('가입 신청에 실패했습니다.');
    }
  };

  const handleAttendSchedule = async (scheduleId) => {
    try {
      await scheduleApi.attendSchedule(scheduleId);
      alert('일정 참석 신청이 완료되었습니다.');
      loadClubData();
    } catch (err) {
      console.error('참석 신청 실패:', err);
      alert('참석 신청에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  if (!clubData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">동호회 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold">Linkle</h1>
            <nav className="flex gap-6">
              <button className="text-gray-700 hover:text-gray-900">동호회</button>
              <button className="text-gray-700 hover:text-gray-900">커뮤니티</button>
              <button className="text-gray-700 hover:text-gray-900">갤러리</button>
            </nav>
          </div>
          <div className="flex gap-4">
            <button className="text-gray-700 hover:text-gray-900">동호회+</button>
            <button className="text-gray-700 hover:text-gray-900">로그인</button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* 왼쪽 영역 */}
          <div className="col-span-2">
            {/* 동호회 메인 이미지 */}
            <div className="bg-gray-200 rounded-lg overflow-hidden mb-6">
              <img 
                src={clubData.mainImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="300"%3E%3Crect width="600" height="300" fill="%23cccccc"/%3E%3C/svg%3E'} 
                alt={clubData.name}
                className="w-full h-80 object-cover"
              />
            </div>

            {/* 동호회 썸네일과 이름 */}
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={clubData.thumbnailUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80"%3E%3Crect width="120" height="80" fill="%23cccccc"/%3E%3C/svg%3E'} 
                  alt={clubData.name}
                  className="w-32 h-24 object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{clubData.name}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{clubData.categoryName}</span>
                  <span>•</span>
                  <span>{clubData.region}</span>
                  <span>•</span>
                  <span>멤버 {clubData.memberCount}</span>
                </div>
              </div>
            </div>

            {/* 탭 메뉴 */}
            <div className="border-b mb-6">
              <div className="flex gap-8">
                <button 
                  onClick={() => setActiveTab('info')}
                  className={`pb-3 font-medium ${activeTab === 'info' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
                >
                  모임 소개
                </button>
                <button 
                  onClick={() => setActiveTab('members')}
                  className={`pb-3 font-medium ${activeTab === 'members' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
                >
                  운영진
                </button>
                <button 
                  onClick={() => setActiveTab('allMembers')}
                  className={`pb-3 font-medium ${activeTab === 'allMembers' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
                >
                  모임 멤버 {clubData.memberCount}
                </button>
              </div>
            </div>

            {/* 탭 컨텐츠 */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-500 text-xl">👋</span>
                  <div>
                    <h3 className="font-bold text-lg mb-2">모임 소개</h3>
                    <div className="text-gray-700 space-y-4">
                      <p className="whitespace-pre-line">{clubData.description}</p>
                      
                      {clubData.since && (
                        <p>
                          <strong>정모 30일(화요)</strong><br />
                          (Since {clubData.since})
                        </p>
                      )}
                      
                      {clubData.membershipInfo && (
                        <p>
                          <strong>연락처세요</strong><br />
                          {clubData.membershipInfo}
                        </p>
                      )}
                      
                      {clubData.location && (
                        <p>
                          <strong>-회소 공지사항-</strong><br />
                          {clubData.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-lg font-bold">
                    <span className="text-xl">👥</span>
                    운영진
                  </h3>
                  <button className="text-sm text-gray-600 hover:text-gray-900">더보기 &gt;</button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {managers.map((manager) => (
                    <div key={manager.memberId} className="flex flex-col items-center">
                      <div className="bg-gray-200 rounded-full w-20 h-20 mb-2 overflow-hidden">
                        <img 
                          src={manager.profileImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23cccccc"/%3E%3C/svg%3E'} 
                          alt={manager.nickname}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`w-4 h-4 rounded-full ${manager.role === 'LEADER' ? 'bg-yellow-400' : 'bg-blue-400'}`}></span>
                        <span className="text-sm font-medium">{manager.nickname}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'allMembers' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-lg font-bold">
                    <span className="text-xl">👥</span>
                    모임 멤버 {clubData.memberCount}
                  </h3>
                  <button className="text-sm text-gray-600 hover:text-gray-900">더보기 &gt;</button>
                </div>
                <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                  {members.map((member) => (
                    <div key={member.memberId} className="flex items-center gap-3">
                      <div className="bg-gray-200 rounded-full w-12 h-12 overflow-hidden flex-shrink-0">
                        <img 
                          src={member.profileImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect width="48" height="48" fill="%23cccccc"/%3E%3C/svg%3E'} 
                          alt={member.nickname}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{member.nickname}</div>
                        <div className="text-sm text-gray-500">{member.position}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽 사이드바 */}
          <div className="space-y-6">
            {/* 동호회 정보 카드 */}
            <div className="border rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">동호회명</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="text-gray-600">{clubData.categoryName}</div>
                <div className="text-gray-600">{clubData.region}</div>
                <div className="text-gray-600">멤버 {clubData.memberCount}</div>
              </div>
              <button 
                onClick={handleJoinClub}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                style={{ backgroundColor: '#4CA8FF' }}
              >
                가입하기
              </button>
            </div>

            {/* 정모 일정 */}
            {schedules && schedules.length > 0 && (
              <div className="border rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">정모 일정</h3>
                <div className="space-y-3">
                  {schedules.map((schedule) => {
                    const startDate = new Date(schedule.scheduleStartDate);
                    const month = startDate.getMonth() + 1;
                    const day = startDate.getDate();
                    const time = startDate.toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false 
                    });

                    return (
                      <div key={schedule.scheduleId} className="border-l-4 border-red-500 pl-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                            {month}/{day}
                          </span>
                          <span className="font-medium">{schedule.title}</span>
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <span>⏰</span>
                          <span>{time}</span>
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <span>📍</span>
                          <span>{schedule.address}</span>
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <span>👥</span>
                          <span>{schedule.attendeeCount || 0}명</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="border-t mt-20 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          © 2025 Linkle
        </div>
      </footer>
    </div>
  );
};

export default ClubDetail;