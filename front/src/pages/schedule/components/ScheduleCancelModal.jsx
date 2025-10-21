import { useState } from 'react';
import { scheduleApi } from '../../../services/api/scheduleApi';

const ScheduleCancelModal = ({ schedule, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await scheduleApi.cancelSchedule(schedule.scheduleId);
      onSuccess();
    } catch (error) {
      console.error('일정 취소 실패:', error);
    } finally {
      setIsLoading(false);
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
    return `오후 ${hours}:${minutes}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center text-red-500 mb-2">
            <span className="text-2xl mr-2">⚠</span>
            <h2 className="text-xl font-bold">일정 취소</h2>
          </div>
        </div>

        <div className="px-6 py-6">
          <p className="text-gray-700 mb-4">다음 일정을 정말 취소하시겠습니까?</p>
          <p className="text-sm text-gray-500 mb-4">취소된 일정은 복구할 수 없습니다</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">{schedule.title}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>📅 {formatDate(schedule.scheduleStartDate)}</div>
              <div>
                🕐 {formatTime(schedule.scheduleStartDate)} ~ {formatTime(schedule.scheduleEndDate)}
              </div>
              {schedule.address && <div>📍 {schedule.address}</div>}
              <div>👥 참석자 {schedule.attendees?.length || 0}명</div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600 flex items-start">
              <span className="mr-2">⚠</span>
              <span>
                주의사항
                <br />
                참석자들에 일정 취소 알림이 발송됩니다
              </span>
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            닫기
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? '취소 중입니다' : '일정 취소'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCancelModal;
