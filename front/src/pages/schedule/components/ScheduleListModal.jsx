const ScheduleListModal = ({ date, schedules, onClose, onScheduleClick, onCreateClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${year}년 ${month}월 ${day}일 ${dayOfWeek}요일`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{formatDate(date)} 일정</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="px-6 py-6 space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.scheduleId}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onScheduleClick(schedule)}
            >
              <h3 className="font-semibold text-gray-900 mb-2">{schedule.title}</h3>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <span className="mr-4">
                  🕐 {formatTime(schedule.scheduleStartDate)} ~{' '}
                  {formatTime(schedule.scheduleEndDate)}
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

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={() => {
              onClose();
              onCreateClick();
            }}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:brightness-110 transition-all"
          >
            일정 추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleListModal;
