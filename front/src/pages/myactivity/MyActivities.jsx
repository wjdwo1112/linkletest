import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberApi } from '../../services/api';
import { EyeIcon, HeartIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import useUserStore from '../../store/useUserStore';
import DEFAULT_PROFILE from '../../assets/images/default-profile.png';

const MyActivities = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchActivities(selectedType);
  }, [selectedType]);

  const fetchActivities = async (type) => {
    try {
      setLoading(true);
      const data = await memberApi.getMyActivities(type);
      setActivities(data);
      setCurrentPage(1);
    } catch (error) {
      console.error('활동 내역 조회 실패:', error);
      alert('활동 내역을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handlePostClick = (postId) => {
    navigate(`/community/posts/${postId}`);
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getProfileSrc = (url) => {
    if (!url || url.trim() === '' || url === 'null') {
      return DEFAULT_PROFILE;
    }
    return url;
  };

  // 페이지네이션
  const totalPages = Math.max(1, Math.ceil(activities.length / itemsPerPage));
  const currentActivities = activities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">나의 활동</h1>

        {/* 프로필 정보 (오른쪽) */}
        {user && (
          <div className="flex items-center gap-3">
            <img
              src={getProfileSrc(user.profileUrl)}
              alt="프로필"
              className="w-32 h-32 rounded-full object-cover bg-gray-100"
            />
            <div>
              <div className="text-xl font-bold text-gray-900">{user.nickname || '사용자'}</div>
              <div className="text-sm text-gray-500 mt-1">주말엔 같이</div>
              <div className="flex gap-2 mt-2">
                <button className="px-6 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  독서
                </button>
                <button className="px-6 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  등산
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 구분선 */}
      <div className="border-b-2 border-gray-200 mb-6"></div>

      {/* 프로필 수정 버튼 */}
      <div className="mb-6 flex justify-center gap-4">
        <button
          onClick={() => navigate('/mypage/profile/edit')}
          className="px-24 py-3 border border-gray-300 rounded-lg text-base hover:bg-gray-50"
        >
          프로필 수정
        </button>
        <button
          onClick={() => navigate('/mypage/interests')}
          className="px-24 py-3 border border-gray-300 rounded-lg text-base hover:bg-gray-50"
        >
          관심사 설정
        </button>
      </div>

      {/* 나의 활동 제목 */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">나의 활동</h2>

      {/* 드롭다운 */}
      <div className="mb-4">
        <select
          value={selectedType}
          onChange={handleTypeChange}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">전체글</option>
          <option value="comments">댓글</option>
          <option value="likes">좋아요한 글</option>
        </select>
      </div>

      {/* 구분선 */}
      <div className="border-b border-gray-300 mb-6"></div>

      {/* 게시글 목록 */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">활동 내역이 없습니다</div>
      ) : (
        <>
          <div className="space-y-6">
            {currentActivities.map((post) => (
              <div key={post.postId} className="border-b border-gray-200 pb-6">
                {/* 제목 */}
                <h3
                  onClick={() => handlePostClick(post.postId)}
                  className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-primary"
                >
                  {post.title}
                </h3>

                {/* 작성자 & 날짜 & 메타 정보 */}
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                  <span className="text-primary font-medium">{post.authorNickname}</span>
                  <span>{post.createdAt}</span>
                  <div className="flex items-center gap-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>{post.viewCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HeartIcon className="w-4 h-4" />
                    <span>{post.likeCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChatBubbleOvalLeftIcon className="w-4 h-4" />
                    <span>{post.commentCount}</span>
                  </div>
                </div>

                {/* 수정/삭제 버튼 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePostClick(post.postId)}
                    className="px-4 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                  >
                    수정
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('정말 삭제하시겠습니까?')) {
                        alert('삭제 기능은 추후 구현 예정입니다.');
                      }
                    }}
                    className="px-4 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-8 gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 border rounded ${
                  currentPage === 1
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-700">{currentPage}</span>
                <span className="text-sm text-gray-400">/</span>
                <span className="text-sm text-gray-700">{totalPages}</span>
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 border rounded ${
                  currentPage === totalPages
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyActivities;
