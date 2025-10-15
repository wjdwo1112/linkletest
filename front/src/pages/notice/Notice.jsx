// // src/pages/club/Notice.jsx
// import React, { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
// import { noticeApi } from '../../services/api/noticeApi';
// import ClubSidebar from '../../components/club/ClubSidebar';

// export default function Notice() {
//   const navigate = useNavigate();
//   const { clubId } = useParams(); // ✅ URL에서 clubId 가져오기
//   const [pinnedNotices, setPinnedNotices] = useState([]);
//   const [notices, setNotices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const totalPages = 1;

//   useEffect(() => {
//     if (!clubId) return;
//     const fetchNotices = async () => {
//       try {
//         setLoading(true);
//         const [pinnedData, noticeData] = await Promise.all([
//           noticeApi.getPinnedNotices(clubId),
//           noticeApi.getNoticeList(clubId),
//         ]);
//         setPinnedNotices(pinnedData || []);
//         setNotices(noticeData || []);
//       } catch (e) {
//         setPinnedNotices([]);
//         setNotices([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchNotices();
//   }, [clubId]);

//   const formatDate = (ds) => {
//     if (!ds) return '';
//     const d = new Date(ds);
//     return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
//   };

//   const renderRow = (notice, isPinned = false) => (
//     <div
//       key={notice.postId}
//       className="px-8 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
//     >
//       <div className="flex items-center">
//         <div className="w-96 flex items-center">
//           {isPinned ? (
//             <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium mr-3">
//               공지
//             </span>
//           ) : (
//             <span className="w-2 h-2 bg-gray-400 rounded-full mr-3" />
//           )}
//           <span className="text-gray-900 hover:text-blue-500 font-medium">{notice.title}</span>
//         </div>
//         <div className="w-32 text-center text-sm text-gray-600">{notice.createdBy || '관리자'}</div>
//         <div className="w-32 text-center text-sm text-gray-500">{formatDate(notice.createdAt)}</div>
//         <div className="w-24 text-center text-sm text-gray-500">{notice.viewCount || 0}</div>
//         <div className="w-16 text-center">
//           <button className="text-gray-400 hover:text-gray-600">⋮</button>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
//         <div className="flex gap-8">
//           <ClubSidebar /> {/* clubId는 URL로 처리하므로 props 불필요 */}
//           <div className="flex-1">
//             <div className="bg-white rounded-lg shadow-sm">
//               <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
//                 <h1 className="text-2xl font-bold text-gray-900">공지사항</h1>
//                 <button
//                   onClick={() => navigate(`/clubs/${clubId}/notice/write`)}
//                   className="bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-600"
//                 >
//                   글쓰기
//                 </button>
//               </div>

//               <div className="px-8 py-4 border-b border-gray-200 bg-gray-50">
//                 <div className="flex items-center">
//                   <div className="w-96">제목</div>
//                   <div className="w-32 text-center">작성자</div>
//                   <div className="w-32 text-center">작성일</div>
//                   <div className="w-24 text-center">조회수</div>
//                   <div className="w-16 text-center"></div>
//                 </div>
//               </div>

//               <div>
//                 {loading ? (
//                   <div className="px-8 py-12 text-center text-gray-500">로딩 중...</div>
//                 ) : (
//                   <>
//                     {pinnedNotices.map((n) => renderRow(n, true))}
//                     {notices.map((n) => renderRow(n, false))}
//                     {pinnedNotices.length === 0 && notices.length === 0 && (
//                       <div className="px-8 py-12 text-center text-gray-500">
//                         등록된 공지사항이 없습니다.
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>

//               <div className="px-8 py-8 flex items-center justify-center">
//                 <div className="flex items-center space-x-4">
//                   <button
//                     onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                     disabled={currentPage === 1}
//                     className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
//                   >
//                     <ChevronLeftIcon className="w-4 h-4" />
//                   </button>
//                   <span className="text-sm text-gray-600">
//                     {currentPage}/{totalPages}
//                   </span>
//                   <button
//                     onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
//                     disabled={currentPage === totalPages}
//                     className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
//                   >
//                     <ChevronRightIcon className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { noticeApi, clubApi } from '../../services/api';
import ClubSidebar from '../../components/layout/ClubSidebar';

// 공지사항 메인 컴포넌트
const NoticeContent = ({ clubId, clubName }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 7; // 페이지당 7개 게시글

  useEffect(() => {
    if (clubId) {
      fetchNotices();
    }
  }, [clubId]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await noticeApi.getNoticesByClubId(clubId);
      setNotices(data || []);
    } catch (err) {
      console.error('공지사항 조회 실패:', err);
      alert('공지사항을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(notices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotices = notices.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleNoticeClick = (postId) => {
    navigate(`/notice/${clubId}/${postId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

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
          <div className="flex-1">제목</div>
          <div className="w-32 text-center">작성자</div>
          <div className="w-32 text-center">작성일</div>
          <div className="w-24 text-center">조회수</div>
        </div>
      </div>

      {/* 공지사항 목록 */}
      <div className="min-h-[450px]">
        {currentNotices.length > 0 ? (
          currentNotices.map((notice) => (
            <div
              key={notice.postId}
              className="px-8 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleNoticeClick(notice.postId)}
            >
              <div className="flex items-center">
                {/* 제목 */}
                <div className="flex-1 flex items-center">
                  {notice.isPinned === 'Y' ? (
                    <span className="text-red-500 font-medium mr-3">[공지]</span>
                  ) : (
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                  )}
                  <span
                    className={`hover:text-blue-500 transition-colors ${
                      notice.isPinned === 'Y' ? 'text-red-500 font-medium' : 'text-gray-900'
                    }`}
                  >
                    {notice.title}
                  </span>
                </div>

                {/* 작성자 - 여기에 실제 작성자 정보가 필요할 수 있습니다 */}
                <div className="w-32 text-center text-sm text-gray-600">관리자</div>

                {/* 작성일 */}
                <div className="w-32 text-center text-sm text-gray-500">
                  {formatDate(notice.createdAt)}
                </div>

                {/* 조회수 */}
                <div className="w-24 text-center text-sm text-gray-500">
                  {notice.viewCount || 0}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-8 py-16 text-center text-gray-500">등록된 공지사항이 없습니다.</div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 0 && (
        <div className="px-8 py-8 flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>

            <span className="text-sm text-gray-600">
              {currentPage}/{totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 전체 페이지
const Notice = () => {
  const { clubId } = useParams();
  const [clubName, setClubName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clubId) {
      fetchClubInfo();
    }
  }, [clubId]);

  const fetchClubInfo = async () => {
    try {
      setLoading(true);
      const clubs = await clubApi.getJoinedClubs();
      const club = clubs.find((c) => c.clubId === parseInt(clubId));
      if (club) {
        setClubName(club.name);
      }
    } catch (err) {
      console.error('동호회 정보 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="flex gap-8">
          {/* 사이드바 */}
          <ClubSidebar clubName={clubName} />

          {/* 공지사항 컨텐츠 */}
          <div className="flex-1">
            <NoticeContent clubId={clubId} clubName={clubName} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notice;
