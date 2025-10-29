import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { noticeApi } from '../../../../services/api/noticeApi';

const NoticeList = ({ clubId }) => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await noticeApi.getNoticesByClubId(clubId);
        setNotices(result.slice(0, 5));
      } catch (error) {
        console.error('공지사항 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clubId]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}.${day}`;
  };

  const handleViewAll = () => {
    navigate(`/clubs/${clubId}/notice`);
  };

  const handleNoticeClick = (postId) => {
    navigate(`/clubs/${clubId}/notice/${postId}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">공지사항</h2>
        <button onClick={handleViewAll} className="text-sm text-primary hover:underline">
          전체 보기
        </button>
      </div>
      {notices.length === 0 ? (
        <div className="text-center text-gray-500">등록된 공지사항이 없습니다</div>
      ) : (
        <div className="space-y-2">
          {notices.map((notice) => (
            <div
              key={notice.postId}
              onClick={() => handleNoticeClick(notice.postId)}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {notice.isPinned === 'Y' && (
                  <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-medium flex-shrink-0">
                    공지
                  </span>
                )}
                <span className="text-gray-900 truncate">{notice.title}</span>
              </div>
              <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
                {formatDate(notice.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticeList;
