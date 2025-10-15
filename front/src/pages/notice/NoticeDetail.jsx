import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { noticeApi } from '../../services/api';
import SidebarLayout from '../../components/layout/SidebarLayout';
import ClubSidebar from '../../components/layout/ClubSidebar';

const NoticeDetail = () => {
  const { clubId, noticeId } = useParams();
  const navigate = useNavigate();

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  // DOMPurify 설정 - ReactQuill에서 사용하는 태그만 허용
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
    if (noticeId) {
      fetchNoticeDetail();
    }
  }, [noticeId]);

  const fetchNoticeDetail = async () => {
    try {
      setLoading(true);
      const data = await noticeApi.getNoticeDetail(noticeId);
      setNotice(data);
    } catch (error) {
      console.error('공지사항 상세 조회 실패:', error);
      alert('공지사항을 불러올 수 없습니다.');
      navigate(`/clubs/${clubId}/notice`);
    } finally {
      setLoading(false);
    }
  };

  // 날짜 포맷팅
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <SidebarLayout sidebar={<ClubSidebar />}>
        <div className="bg-white p-8">
          <div className="text-center text-gray-500">로딩 중...</div>
        </div>
      </SidebarLayout>
    );
  }

  if (!notice) {
    return (
      <SidebarLayout sidebar={<ClubSidebar />}>
        <div className="bg-white p-8">
          <div className="text-center text-gray-500">공지사항을 찾을 수 없습니다.</div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout sidebar={<ClubSidebar />}>
      <div className="bg-white p-8">
        {/* 공지사항 카테고리 */}
        <div className="mb-6">
          <span className="text-sm text-blue-500 font-medium">공지사항</span>
        </div>

        {/* 제목 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{notice.title}</h1>

        {/* 작성자 정보 */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {notice.authorNickname ? notice.authorNickname[0] : '관'}
            </span>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">
              {notice.authorNickname || '관리자'}
            </div>
            <div className="text-xs text-gray-400">
              {formatDateTime(notice.createdAt)} 조회 {notice.viewCount || 0}
            </div>
          </div>
        </div>

        {/* 본문 내용 */}
        <div className="mb-8">
          {/* 이모티콘 */}
          <div className="mb-6 text-4xl"></div>

          {/* 내용 - DOMPurify로 HTML 안전하게 렌더링 */}
          <div
            className="text-gray-700 leading-relaxed prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(notice.content, sanitizeConfig),
            }}
          />

          {/* 이미지가 있는 경우 */}
          {notice.images && (
            <div className="mt-6">
              {notice.images.split(',').map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl.trim()}
                  alt={`공지사항 이미지 ${index + 1}`}
                  className="max-w-full h-auto rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 하단 목록 버튼 */}
        <div className="pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate(`/clubs/${clubId}/notice`)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            목록
          </button>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default NoticeDetail;
