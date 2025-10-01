import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// 공지사항 메인 컴포넌트 (MyPageLayout children으로 들어갈 부분)
const NoticeContent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;

  const notices = [
    {
      id: 1,
      category: '공지',
      title: '2025년 서울 예체전 정식종목 출전계획',
      author: '관리자',
      date: '2025.09.11',
      views: 10,
      isImportant: true,
    },
    {
      id: 2,
      category: '공지',
      title: '전체시기클럽닫 공동골 처리는 법칙',
      author: '관리',
      date: '2025.09.11',
      views: 10,
      isImportant: true,
    },
    {
      id: 3,
      category: '공지',
      title: '사정변 조전예쓰!!!',
      author: '관리',
      date: '2025.09.11',
      views: 10,
      isImportant: true,
    },
    {
      id: 4,
      category: '일반',
      title: '버밀돌대출',
      author: '관리',
      date: '2025.09.11',
      views: 5,
      isImportant: false,
    },
    {
      id: 5,
      category: '일반',
      title: '5-6월 신청자 모집',
      author: '관리',
      date: '2025.09.11',
      views: 10,
      isImportant: false,
    },
    {
      id: 6,
      category: '일반',
      title: '5-6월 신청자 모집 마감되었습니다.',
      author: '관리',
      date: '2025.09.11',
      views: 10,
      isImportant: false,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* 헤더 */}
      <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">공지사항</h1>
        <button className="bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
          글쓰기
        </button>
      </div>

      {/* 테이블 헤더 */}
      <div className="px-8 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="w-96">제목</div>
          <div className="w-32 text-center">작성자</div>
          <div className="w-32 text-center">작성일</div>
          <div className="w-24 text-center">조회수</div>
          <div className="w-16 text-center"></div>
        </div>
      </div>

      {/* 공지사항 목록 */}
      <div>
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="px-8 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              {/* 제목 */}
              <div className="w-96 flex items-center">
                {notice.isImportant ? (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium mr-3">
                    공지
                  </span>
                ) : (
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                )}
                <span className="text-gray-900 hover:text-blue-500 cursor-pointer font-medium">
                  {notice.title}
                </span>
              </div>

              {/* 작성자 */}
              <div className="w-32 text-center text-sm text-gray-600">{notice.author}</div>

              {/* 작성일 */}
              <div className="w-32 text-center text-sm text-gray-500">{notice.date}</div>

              {/* 조회수 */}
              <div className="w-24 text-center text-sm text-gray-500">{notice.views}</div>

              {/* 더보기 버튼 */}
              <div className="w-16 text-center">
                <button className="text-gray-400 hover:text-gray-600 transition-colors">⋮</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="px-8 py-8 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>

          <span className="text-sm text-gray-600">
            {currentPage}/{totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 전체 페이지 (MyPageLayout 사용)
const Notice = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="flex gap-8">
          <div className="flex-1">
            <NoticeContent />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notice;
