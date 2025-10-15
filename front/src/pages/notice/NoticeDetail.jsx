// NoticeDetail.jsx (선 추가 버전)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { noticeApi } from '../../services/api';
import SidebarLayout from '../../components/layout/SidebarLayout';
import ClubSidebar from '../../components/layout/ClubSidebar';

const NoticeDetail = () => {
  const { clubId, noticeId } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

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
    (async () => {
      try {
        setLoading(true);
        const data = await noticeApi.getNoticeDetail(noticeId);
        setNotice(data);
      } catch (e) {
        console.error(e);
        alert('공지사항을 불러올 수 없습니다.');
        navigate(`/clubs/${clubId}/notice`);
      } finally {
        setLoading(false);
      }
    })();
  }, [clubId, noticeId, navigate]);

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
        {/* 1) 상단 바 + 하단 구분선 */}
        <div className="mb-4 flex items-center justify-between pb-3 border-b border-gray-200">
          <span className="text-sm text-blue-500 font-medium">공지사항</span>
          <button
            onClick={() => navigate(`/clubs/${clubId}/notice`)}
            className="px-4 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            목록
          </button>
        </div>

        {/* 제목 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{notice.title}</h1>

        {/* 2) 작성자 메타 + 하단 구분선 */}
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-200">
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

        {/* 본문 */}
        <div
          className="text-gray-700 leading-relaxed prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(notice.content, sanitizeConfig),
          }}
        />

        {/* 이미지가 있는 경우 */}
        {notice.images && (
          <div className="mt-6">
            {notice.images.split(',').map((url, i) => (
              <img
                key={i}
                src={url.trim()}
                alt={`공지사항 이미지 ${i + 1}`}
                className="max-w-full h-auto rounded-lg"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ))}
          </div>
        )}

        {/* 3) 본문 끝 얇은 구분선(선택) */}
        <div className="mt-8 border-b border-gray-200" />
      </div>
    </SidebarLayout>
  );
};

export default NoticeDetail;
