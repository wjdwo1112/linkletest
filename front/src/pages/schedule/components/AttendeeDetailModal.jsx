const AttendeeDetailModal = ({ attendees, onClose }) => {
  const getAttendeesByStatus = (status) => {
    return attendees.filter((a) => a.attendanceStatus === status);
  };

  const attendList = getAttendeesByStatus('ATTEND');
  const absentList = getAttendeesByStatus('ABSENT');
  const waitingList = getAttendeesByStatus('WAITING');

  const getProfileImage = (url) => {
    if (!url || url.trim() === '' || url === 'null') {
      return 'https://via.placeholder.com/40/CCCCCC/FFFFFF?text=U';
    }
    return url;
  };

  const AttendeeList = ({ title, count, list, statusColor }) => (
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">
        {title} {count}
      </h3>
      {list.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          {title.split(' ')[0]} 회원이 없습니다
        </p>
      ) : (
        <div className="space-y-2">
          {list.map((attendee) => (
            <div
              key={attendee.memberId}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
            >
              <img
                src={getProfileImage(attendee.profileImageUrl)}
                alt={attendee.nickname}
                className="w-10 h-10 rounded-full bg-gray-200"
              />
              <span className="flex-1 text-gray-900">{attendee.nickname}</span>
              <span className={`text-sm ${statusColor}`}>
                {attendee.attendanceStatus === 'ATTEND' && '✓ 참석'}
                {attendee.attendanceStatus === 'ABSENT' && '✗ 불참'}
                {attendee.attendanceStatus === 'WAITING' && '? 미정'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">참석자 현황</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          <AttendeeList
            title="참석"
            count={attendList.length}
            list={attendList}
            statusColor="text-green-600"
          />

          <div className="border-t border-gray-200 pt-6">
            <AttendeeList
              title="불참"
              count={absentList.length}
              list={absentList}
              statusColor="text-red-600"
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <AttendeeList
              title="미정"
              count={waitingList.length}
              list={waitingList}
              statusColor="text-gray-600"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendeeDetailModal;
