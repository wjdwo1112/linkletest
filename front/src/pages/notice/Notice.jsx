import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { noticeApi, clubApi } from '../../services/api';
import SidebarLayout from '../../components/layout/SidebarLayout';
import ClubSidebar from '../../components/layout/ClubSidebar';
import ConfirmModal from '../../components/common/ConfirmModal';
import AlertModal from '../../components/common/AlertModal';

// 케밥 메뉴 컴포넌트
function KebabMenu({ notice, onEdit, onDelete, onTogglePin }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const isPinned = notice.isPinned === 'Y';

  return (
    <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label="메뉴"
        aria-expanded={open ? 'true' : 'false'}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-1 hover:bg-gray-100 rounded"
      >
        <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-8 w-32 rounded-md border border-gray-200 bg-white shadow-lg z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setOpen(false);
              onTogglePin();
            }}
            className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            role="menuitem"
          >
            <MapPinIcon className="w-4 h-4" />
            {isPinned ? '고정 해제' : '상단 고정'}
          </button>
          <div className="h-px bg-gray-100" />
          <button
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            role="menuitem"
          >
            <PencilSquareIcon className="w-4 h-4" />
            수정
          </button>
          <div className="h-px bg-gray-100" />
          <button
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            role="menuitem"
          >
            <TrashIcon className="w-4 h-4" />
            삭제
          </button>
        </div>
      )}
    </div>
  );
}

const Notice = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [notices, setNotices] = useState([]);
  const [pinnedNotices, setPinnedNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
  });
  const itemsPerPage = 10;

  useEffect(() => {
    if (clubId) {
      fetchNotices();
      fetchUserRole();
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

  // 사용자의 동호회 내 역할 조회
  const fetchUserRole = async () => {
    try {
      const clubs = await clubApi.getJoinedClubs();
      const currentClub = clubs.find((c) => String(c.clubId) === String(clubId));
      if (currentClub) {
        setUserRole(currentClub.role);
      }
    } catch (error) {
      console.error('역할 조회 실패:', error);
    }
  };

  // 모임장 또는 운영진인지 확인
  const isManager = userRole === 'LEADER' || userRole === 'MANAGER';

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const closeAlert = () => {
    setAlertModal({
      isOpen: false,
      title: '',
      message: '',
    });
  };

  // 수정 핸들러
  const handleEdit = (noticeId) => {
    navigate(`/clubs/${clubId}/notice/edit/${noticeId}`);
  };

  // 삭제 핸들러
  const handleDelete = (noticeId) => {
    setConfirmModal({
      isOpen: true,
      title: '공지사항 삭제',
      message: '이 공지사항을 삭제하시겠습니까?',
      onConfirm: async () => {
        try {
          await noticeApi.deleteNotice(noticeId);
          await fetchNotices();
          setAlertModal({
            isOpen: true,
            title: '삭제 완료',
            message: '공지사항이 삭제되었습니다.',
          });
        } catch (error) {
          console.error('공지사항 삭제 실패:', error);
          setAlertModal({
            isOpen: true,
            title: '오류',
            message: '공지사항 삭제에 실패했습니다.',
          });
        }
      },
    });
  };

  // 고정/해제 핸들러 - await 추가
  const handleTogglePin = async (noticeId) => {
    try {
      await noticeApi.togglePin(noticeId);
      // fetchNotices()에 await를 추가하여 에러가 발생하면 catch에서 처리
      await fetchNotices();
    } catch (error) {
      console.error('고정 상태 변경 실패:', error);
      setAlertModal({
        isOpen: true,
        title: '오류',
        message: '고정 상태 변경에 실패했습니다.',
      });
    }
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
        <div className="flex-1 flex items-center gap-3">
          {isPinned && (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
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

        {/* 오버플로우 메뉴 - 모임장 또는 운영진만 표시 */}
        {isManager && (
          <div className="w-12 flex justify-center">
            <KebabMenu
              notice={notice}
              onEdit={() => handleEdit(notice.postId)}
              onDelete={() => handleDelete(notice.postId)}
              onTogglePin={() => handleTogglePin(notice.postId)}
            />
          </div>
        )}
      </div>
    </div>
  );

  // 페이지네이션
  const totalPages = Math.max(1, Math.ceil(notices.length / itemsPerPage));
  const currentNotices = notices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <SidebarLayout sidebar={<ClubSidebar />}>
      <div>
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">공지사항</h1>
          {isManager && (
            <button
              onClick={() => navigate(`/clubs/${clubId}/notice/write`)}
              className="flex items-center gap-1.5 bg-[#4CA8FF] text-white px-5 py-1.5 rounded-lg text-sm font-medium hover:bg-[#4CA8FF]/90 transition-colors"
            >
              등록
            </button>
          )}
        </div>

        {/* 테이블 */}
        <div className="bg-white">
          {/* 테이블 헤더 */}
          <div className="px-8 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <div className="flex-1">제목</div>
              <div className="w-32 text-center">작성자</div>
              <div className="w-32 text-center">작성일</div>
              <div className="w-24 text-center">조회수</div>
              {isManager && <div className="w-12"></div>}
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
          {!loading && (pinnedNotices.length > 0 || notices.length > 0) && (
            <div className="px-8 py-6 flex items-center justify-center border-t border-gray-100">
              <div className="flex items-center gap-2">
                {/* 이전 페이지 버튼 */}
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded border ${
                    currentPage === 1
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>

                {/* 페이지 번호 */}
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[2.5rem] px-3 py-2 rounded text-sm font-medium ${
                      currentPage === page
                        ? 'bg-[#4CA8FF] text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* 다음 페이지 버튼 */}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded border ${
                    currentPage === totalPages
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="확인"
        cancelText="취소"
      />

      {/* AlertModal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
      />
    </SidebarLayout>
  );
};

export default Notice;
