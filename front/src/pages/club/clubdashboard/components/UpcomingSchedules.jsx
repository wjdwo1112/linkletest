import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { scheduleApi } from '../../../../services/api/scheduleApi';

const UpcomingSchedules = ({ clubId }) => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await scheduleApi.getSchedulesByClubId(clubId);
        const now = new Date();
        const upcoming = result
          .filter((s) => new Date(s.scheduleStartDate) >= now)
          .sort((a, b) => new Date(a.scheduleStartDate) - new Date(b.scheduleStartDate))
          .slice(0, 3);
        setSchedules(upcoming);
      } catch (error) {
        console.error('일정 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clubId]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `오후 ${hours}:${minutes}`;
  };

  const handleViewAll = () => {
    navigate(`/clubs/${clubId}/schedule`);
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
        <h2 className="text-lg font-bold text-gray-900">다가오는 일정</h2>
        <button onClick={handleViewAll} className="text-sm text-primary hover:underline">
          전체 보기
        </button>
      </div>
      <div className="space-y-4">
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">다가오는 일정이 없습니다</div>
        ) : (
          schedules.map((schedule) => (
            <div key={schedule.scheduleId} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{schedule.title}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(schedule.scheduleStartDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>
                    {formatTime(schedule.scheduleStartDate)} ~{' '}
                    {formatTime(schedule.scheduleEndDate)}
                  </span>
                </div>
                {schedule.address && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="truncate">{schedule.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingSchedules;
