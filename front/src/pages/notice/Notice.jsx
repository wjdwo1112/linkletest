import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PencilIcon } from '@heroicons/react/24/outline';
import { noticeApi, clubApi } from '../../services/api';
import SidebarLayout from '../../components/layout/SidebarLayout';
import ClubSidebar from '../../components/layout/ClubSidebar';

const Notice = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [notices, setNotices] = useState([]);
  const [pinnedNotices, setPinnedNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (clubId) {
      fetchNotices();
    }
  }, [clubId]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await noticeApi.getNoticesByClubId(clubId);

      // 고정 공지와 일반 공지 분리
      const pinned = data.filter((n) => n.isPinned === 'Y');
      const normal = data.filter((n) => n.isPinned !== 'Y');

      setPinnedNotices(pinned);
      setNotices(normal);
    } catch (error) {
      console.error('공지사항 조회 실패:', error);
      setNotices([]);
      setPinnedNotices([]);
    } finally {
      setLoading(false);
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 공지사항 행 렌더링
  const renderNoticeRow = (notice, isPinned = false) => (
    <div
      key={notice.postId}
      onClick={() => navigate(`/clubs/${clubId}/notice/${notice.postId}`)}
      className="px-8 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex items-center">
        {/* 제목 */}
        <div className="flex-1 flex items-center">
          {isPinned && (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium mr-3">
              공지
            </span>
          )}
          <span className="text-gray-900 font-medium hover:text-blue-500">{notice.title}</span>
        </div>

        {/* 작성자 */}
        <div className="w-32 text-center text-sm text-gray-600">{notice.nickname || '관리자'}</div>

        {/* 작성일 */}
        <div className="w-32 text-center text-sm text-gray-500">{formatDate(notice.createdAt)}</div>

        {/* 조회수 */}
        <div className="w-24 text-center text-sm text-gray-500">{notice.viewCount || 0}</div>
      </div>
    </div>
  );

  // 페이지네이션
  const totalPages = Math.ceil(notices.length / itemsPerPage);
  const currentNotices = notices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <SidebarLayout sidebar={<ClubSidebar />}>
      <div className="bg-white rounded-lg shadow-sm">
        {/* 헤더 */}
        <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">공지사항</h1>
          <button
            onClick={() => navigate(`/clubs/${clubId}/notice/write`)}
            className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
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

        {/* 공지사항 리스트 */}
        <div>
          {loading ? (
            <div className="px-8 py-12 text-center text-gray-500">로딩 중...</div>
          ) : (
            <>
              {/* 고정 공지 */}
              {pinnedNotices.map((notice) => renderNoticeRow(notice, true))}

              {/* 일반 공지 */}
              {currentNotices.map((notice) => renderNoticeRow(notice, false))}

              {/* 공지사항 없음 */}
              {pinnedNotices.length === 0 && notices.length === 0 && (
                <div className="px-8 py-12 text-center text-gray-500">
                  등록된 공지사항이 없습니다.
                </div>
              )}
            </>
          )}
        </div>

        {/* 페이지네이션 */}
        {!loading && notices.length > 0 && (
          <div className="px-8 py-6 flex items-center justify-center border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ◀
              </button>

              <span className="text-sm text-gray-600 px-4">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Notice;
