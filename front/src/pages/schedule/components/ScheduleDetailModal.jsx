import { useState, useEffect, useCallback } from 'react';
import { scheduleApi } from '../../../services/api/scheduleApi';
import ScheduleCancelModal from './ScheduleCancelModal';
import AttendeeDetailModal from './AttendeeDetailModal';

const ScheduleDetailModal = ({ schedule, onClose, onSuccess }) => {
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAttendeeModal, setShowAttendeeModal] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await scheduleApi.getSchedule(schedule.scheduleId);
      setDetailData(data);
    } catch (error) {
      console.error('일정 상세 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [schedule.scheduleId]);

  useEffect(() => {
    fetchDetail();
  }, [schedule.scheduleId, fetchDetail]);

  const handleAttendanceChange = async (status) => {
    try {
      await scheduleApi.updateAttendanceStatus(schedule.scheduleId, status);
      await fetchDetail();
    } catch (error) {
      console.error('참석 상태 변경 실패:', error);
    }
  };

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

  const getAttendeesByStatus = (status) => {
    if (!detailData?.attendees) return [];
    return detailData.attendees.filter((a) => a.attendanceStatus === status);
  };

  const attendCount = getAttendeesByStatus('ATTEND').length;
  const absentCount = getAttendeesByStatus('ABSENT').length;
  const waitingCount = getAttendeesByStatus('WAITING').length;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="text-center text-gray-500">로딩 중입니다</div>
        </div>
      </div>
    );
  }

  if (!detailData) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">일정 상세</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <div className="px-6 py-6 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{detailData.title}</h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-gray-700">
                <span className="mr-2">📅</span>
                <span>{formatDate(detailData.scheduleStartDate)}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="mr-2">🕐</span>
                <span>
                  {formatTime(detailData.scheduleStartDate)} ~{' '}
                  {formatTime(detailData.scheduleEndDate)}
                </span>
              </div>
            </div>

            {detailData.address && (
              <div className="flex items-center text-gray-700">
                <span className="mr-2">📍</span>
                <span>{detailData.address}</span>
                {detailData.addressDetail && (
                  <span className="ml-1">({detailData.addressDetail})</span>
                )}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-gray-900 font-semibold">
                  <span className="mr-2">👥</span>
                  <span>참석자</span>
                </div>
                <button
                  onClick={() => setShowAttendeeModal(true)}
                  className="text-sm text-primary hover:underline"
                >
                  모두 보기
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center">
                  <span className="text-green-600 mr-1">✓</span>
                  <span>참석 {attendCount}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-red-600 mr-1">✗</span>
                  <span>불참 {absentCount}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-1">?</span>
                  <span>미정 {waitingCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-3">참석 여부를 선택해주세요</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAttendanceChange('ATTEND')}
                  className="flex-1 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                >
                  ✓ 참석
                </button>
                <button
                  onClick={() => handleAttendanceChange('ABSENT')}
                  className="flex-1 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                >
                  ✗ 불참
                </button>
                <button
                  onClick={() => handleAttendanceChange('WAITING')}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ? 미정
                </button>
              </div>
            </div>

            {detailData.content && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">상세 내용</h4>
                <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {detailData.content}
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              일정 취소
            </button>
          </div>
        </div>
      </div>

      {showCancelModal && (
        <ScheduleCancelModal
          schedule={detailData}
          onClose={() => setShowCancelModal(false)}
          onSuccess={() => {
            setShowCancelModal(false);
            onSuccess();
          }}
        />
      )}

      {showAttendeeModal && (
        <AttendeeDetailModal
          attendees={detailData.attendees || []}
          onClose={() => setShowAttendeeModal(false)}
        />
      )}
    </>
  );
};

export default ScheduleDetailModal;
