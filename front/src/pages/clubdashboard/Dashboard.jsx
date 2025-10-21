const ClubDashboard = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">대시보드</h1>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-gray-600 text-sm mb-2">전체 회원</div>
          <div className="text-3xl font-bold text-gray-900">127명</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-gray-600 text-sm mb-2">이번 달 활동</div>
          <div className="text-3xl font-bold text-gray-900">23건</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-gray-600 text-sm mb-2">신규 가입</div>
          <div className="text-3xl font-bold text-gray-900">8명</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">최근 공지사항</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="text-gray-900">정기 모임 일정 안내</div>
              <div className="text-sm text-gray-500">2025.10.{15 + i}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">최근 게시글</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="text-gray-900">게시글 제목입니다</div>
              <div className="text-sm text-gray-500">10월 {10 + i}일</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClubDashboard;
