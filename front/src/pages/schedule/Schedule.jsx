import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { scheduleApi } from '../../services/api/scheduleApi';
import ScheduleCreateModal from '../schedule/components/ScheduleCreateModal';
import ScheduleDetailModal from '../schedule/components/ScheduleDetailModal';
import ScheduleListModal from '../schedule/components/ScheduleListModal';

const Schedule = () => {
  const { clubId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const data = await scheduleApi.getSchedulesByClubId(clubId);
      setSchedules(data);

      // 다가오는 일정 필터링 (현재 이후 일정만)
      const now = new Date();
      const upcoming = data
        .filter((s) => new Date(s.scheduleStartDate) >= now)
        .sort((a, b) => new Date(a.scheduleStartDate) - new Date(b.scheduleStartDate))
        .slice(0, 3);
      setUpcomingSchedules(upcoming);
    } catch (error) {
      console.error('일정 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    if (clubId) {
      fetchSchedules();
    }
  }, [clubId, fetchSchedules]);

  // FullCalendar용 이벤트 데이터 변환
  const calendarEvents = schedules.map((schedule) => {
    const startDate = new Date(schedule.scheduleStartDate);
    const endDate = new Date(schedule.scheduleEndDate);

    // 같은 날짜인 경우 end를 설정하지 않음
    const isSameDay = startDate.toISOString().split('T')[0] === endDate.toISOString().split('T')[0];

    return {
      id: schedule.scheduleId,
      title: schedule.title,
      start: schedule.scheduleStartDate,
      end: isSameDay ? undefined : schedule.scheduleEndDate,
      allDay: true,
      extendedProps: {
        ...schedule,
      },
    };
  });

  // 날짜 클릭 핸들러
  const handleDateClick = (info) => {
    const clickedDate = info.dateStr;

    // 해당 날짜에 걸쳐있는 모든 일정 찾기
    const daySchedules = schedules.filter((s) => {
      const startDate = new Date(s.scheduleStartDate);
      const endDate = new Date(s.scheduleEndDate);
      const clicked = new Date(clickedDate);

      // 시간 제거하고 날짜만 비교
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      clicked.setHours(0, 0, 0, 0);

      // 클릭한 날짜가 일정 기간 내에 있는지 확인
      return clicked >= startDate && clicked <= endDate;
    });

    if (daySchedules.length > 0) {
      setSelectedDate(clickedDate);
      setShowListModal(true);
    } else {
      setSelectedDate(clickedDate);
      setShowCreateModal(true);
    }
  };

  // 일정 클릭 핸들러
  const handleEventClick = (info) => {
    const scheduleId = parseInt(info.event.id);
    const schedule = schedules.find((s) => s.scheduleId === scheduleId);
    if (schedule) {
      setSelectedSchedule(schedule);
      setShowDetailModal(true);
    }
  };

  // 일정 추가 버튼 핸들러
  const handleCreateClick = () => {
    setSelectedDate(null);
    setShowCreateModal(true);
  };

  // 다가오는 일정 항목 클릭
  const handleUpcomingClick = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDetailModal(true);
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDateTime = (startDate, endDate) => {
    return `${formatTime(startDate)} ~ ${formatTime(endDate)}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center text-gray-500">로딩 중입니다</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">일정 관리</h1>
        <button
          onClick={handleCreateClick}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:brightness-110 transition-all"
        >
          + 일정 추가
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="ko"
          headerToolbar={{
            left: 'prev',
            center: 'title',
            right: 'next',
          }}
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          dayMaxEvents={3}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">다가오는 일정</h2>
        {upcomingSchedules.length === 0 ? (
          <div className="text-center text-gray-500 py-8">예정된 일정이 없습니다</div>
        ) : (
          <div className="space-y-4">
            {upcomingSchedules.map((schedule) => (
              <div
                key={schedule.scheduleId}
                onClick={() => handleUpcomingClick(schedule)}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{schedule.title}</h3>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <span className="mr-4">📅 {formatDate(schedule.scheduleStartDate)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <span className="mr-4">
                    🕐 {formatDateTime(schedule.scheduleStartDate, schedule.scheduleEndDate)}
                  </span>
                </div>
                {schedule.address && (
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <span>📍 {schedule.address}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <span>👥 참석자 {schedule.attendeeCount}명</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <ScheduleCreateModal
          clubId={clubId}
          selectedDate={selectedDate}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedDate(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setSelectedDate(null);
            fetchSchedules();
          }}
        />
      )}

      {showDetailModal && selectedSchedule && (
        <ScheduleDetailModal
          schedule={selectedSchedule}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSchedule(null);
          }}
          onSuccess={() => {
            setShowDetailModal(false);
            setSelectedSchedule(null);
            fetchSchedules();
          }}
        />
      )}

      {showListModal && selectedDate && (
        <ScheduleListModal
          date={selectedDate}
          schedules={schedules.filter((s) => {
            const startDate = new Date(s.scheduleStartDate);
            const endDate = new Date(s.scheduleEndDate);
            const selected = new Date(selectedDate);

            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            selected.setHours(0, 0, 0, 0);

            return selected >= startDate && selected <= endDate;
          })}
          onClose={() => {
            setShowListModal(false);
            setSelectedDate(null);
          }}
          onScheduleClick={(schedule) => {
            setShowListModal(false);
            setSelectedSchedule(schedule);
            setShowDetailModal(true);
          }}
          onCreateClick={() => {
            setShowListModal(false);
            setShowCreateModal(true);
          }}
        />
      )}
    </div>
  );
};

export default Schedule;
