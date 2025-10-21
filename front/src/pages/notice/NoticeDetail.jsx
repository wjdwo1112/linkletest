// NoticeDetail.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { noticeApi, clubApi } from '../../services/api';
import { fileApi } from '../../services/api/fileApi';
import SidebarLayout from '../../components/layout/SidebarLayout';
import ClubSidebar from '../../components/layout/ClubSidebar';
import DEFAULT_PROFILE from '../../assets/images/default-profile.png';

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
        <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
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

const NoticeDetail = () => {
  const { clubId, noticeId } = useParams();
  const navigate = useNavigate();

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [imageFiles, setImageFiles] = useState([]); // fileId로 조회한 이미지 파일 목록

  const sanitizeConfig = {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      's',
      'h1',
      'h2',
      'h3',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'blockquote',
      'code',
      'pre',
      'span',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target'],
    ALLOW_DATA_ATTR: false,
  };

  useEffect(() => {
    if (clubId && noticeId) {
      fetchNotice();
      fetchUserRole();
    }
  }, [clubId, noticeId]);

  const fetchNotice = async () => {
    try {
      setLoading(true);
      const data = await noticeApi.getNoticeDetail(noticeId);
      setNotice(data);

      // 이미지가 있으면 처리
      if (data.images) {
        // URL 형식인지 fileId 형식인지 판별
        if (data.images.includes('http')) {
          // 기존 URL 형식 (comma-separated): "url1,url2,url3"
          const imageUrls = data.images.split(',').map((url) => url.trim());
          const filesData = imageUrls.map((url, index) => ({
            fileId: null,
            fileLink: url,
            originalFileName: `이미지 ${index + 1}`,
          }));
          setImageFiles(filesData);
        } else {
          // 새로운 fileId 형식 (slash-separated): "1/2/3"
          const fileIds = data.images.split('/').map((id) => parseInt(id.trim()));

          try {
            // 각 fileId로 파일 정보 조회
            const fileInfos = await fileApi.getFiles(fileIds);
            setImageFiles(fileInfos);
          } catch (error) {
            console.error('파일 정보 조회 실패:', error);
            setImageFiles([]);
          }
        }
      }
    } catch (e) {
      console.error(e);
      alert('공지사항을 불러올 수 없습니다.');
      navigate(`/clubs/${clubId}/notice`);
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

  // 수정 핸들러
  const handleEdit = () => {
    navigate(`/clubs/${clubId}/notice/edit/${noticeId}`);
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!window.confirm('이 공지사항을 삭제하시겠습니까?')) return;

    try {
      await noticeApi.deleteNotice(noticeId);
      alert('공지사항이 삭제되었습니다.');
      navigate(`/clubs/${clubId}/notice`);
    } catch (error) {
      console.error('공지사항 삭제 실패:', error);
      alert('공지사항 삭제에 실패했습니다.');
    }
  };

  // 고정/해제 핸들러
  const handleTogglePin = async () => {
    try {
      await noticeApi.togglePin(noticeId);
      alert('고정 상태가 변경되었습니다.');
      await fetchNotice();
    } catch (error) {
      console.error('고정 상태 변경 실패:', error);
      alert('고정 상태 변경에 실패했습니다.');
    }
  };

  const getProfileSrc = (url) => {
    if (!url || url.trim() === '' || url === 'null') {
      return DEFAULT_PROFILE;
    }
    return url;
  };

  const formatDateTime = (s) => {
    if (!s) return '';
    const d = new Date(s);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}.${m}.${day} ${hh}:${mm}`;
  };

  if (loading) {
    return (
      <SidebarLayout sidebar={<ClubSidebar />}>
        <div className="bg-white p-8 text-center text-gray-500">로딩 중...</div>
      </SidebarLayout>
    );
  }

  if (!notice) {
    return (
      <SidebarLayout sidebar={<ClubSidebar />}>
        <div className="bg-white p-8 text-center text-gray-500">공지사항을 찾을 수 없습니다.</div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout sidebar={<ClubSidebar />}>
      <div className="bg-white p-8">
        {/* 상단 바 + 오버플로우 메뉴 + 하단 구분선 */}
        <div className="mb-4 flex items-center justify-between pb-3 border-b border-gray-200">
          <span className="text-sm text-blue-500 font-medium">공지사항</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/clubs/${clubId}/notice`)}
              className="px-4 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              목록
            </button>
            {/* 모임장 또는 운영진만 오버플로우 메뉴 표시 */}
            {isManager && (
              <KebabMenu
                notice={notice}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
              />
            )}
          </div>
        </div>

        {/* 제목 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{notice.title}</h1>

        {/* 작성자 메타 + 하단 구분선 */}
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-200">
          <img
            src={getProfileSrc(notice.profileUrl)}
            alt={notice.authorNickname || '프로필'}
            className="w-10 h-10 rounded-full object-cover bg-gray-100"
          />
          <div>
            <div className="text-sm font-semibold text-gray-800">
              {notice.authorNickname || '관리자'}
            </div>
            <div className="text-xs text-gray-400">
              {formatDateTime(notice.createdAt)} 조회 {notice.viewCount || 0}
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div
          className="text-gray-700 leading-relaxed prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(notice.content, sanitizeConfig),
          }}
        />

        {/* 이미지가 있는 경우 - fileId 기반으로 불러온 이미지 표시 */}
        {imageFiles.length > 0 && (
          <div className="mt-6 space-y-4">
            {imageFiles.map((file, i) => (
              <img
                key={file.fileId || i}
                src={file.fileLink}
                alt={file.originalFileName || `공지사항 이미지 ${i + 1}`}
                className="max-w-full h-auto rounded-lg bg-gray-100"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ))}
          </div>
        )}

        {/* 본문 끝 얇은 구분선 */}
        <div className="mt-8 border-b border-gray-200" />
      </div>
    </SidebarLayout>
  );
};

export default NoticeDetail;
