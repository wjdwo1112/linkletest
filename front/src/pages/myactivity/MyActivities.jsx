import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const MyActivities = () => {
  const navigate = useNavigate();
  const [allActivities, setAllActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('ALL'); // ALL, POST, COMMENT
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchActivities();
  }, [filterType]);

  useEffect(() => {
    setCurrentPage(1); // 필터 변경 시 첫 페이지로
  }, [filterType]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE_URL}/member/activities`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          type: filterType,
        },
      });

      setAllActivities(response.data || []);
    } catch (error) {
      console.error('활동 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 현재 페이지에 표시할 데이터
  const totalPages = Math.ceil(allActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = allActivities.slice(startIndex, endIndex);

  const handleEdit = (postId, clubId) => {
    navigate(`/clubs/${clubId}/posts/${postId}/edit`);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_BASE_URL}/member/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('삭제되었습니다.');
      fetchActivities();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const goToPost = (clubId, postId) => {
    navigate(`/clubs/${clubId}/posts/${postId}`);
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">나의 활동</h1>

        {/* 필터 드롭다운 */}
        <div className="mb-6">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4CA8FF]"
          >
            <option value="ALL">전체 글</option>
            <option value="POST">작성한 글</option>
            <option value="COMMENT">댓글 단 글</option>
          </select>
        </div>

        <div className="border-t-2 border-[#4CA8FF]">
          {/* 활동 목록 */}
          {loading ? (
            <div className="py-20 text-center text-gray-500">로딩 중...</div>
          ) : allActivities.length === 0 ? (
            <div className="py-20 text-center text-gray-500">활동 내역이 없습니다.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {currentActivities.map((activity) => (
                <div key={activity.postId} className="py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 제목 */}
                      <h3
                        onClick={() => goToPost(activity.clubId, activity.postId)}
                        className="text-lg font-medium mb-2 cursor-pointer hover:text-[#4CA8FF]"
                      >
                        {activity.title}
                      </h3>

                      {/* 클럽명, 날짜, 통계 */}
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="px-3 py-1 bg-[#E3F2FF] text-[#4CA8FF] rounded-full text-xs font-medium">
                          {activity.clubName}
                        </span>
                        <span>{formatDate(activity.createdAt)}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span>{activity.viewCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                            <span>{activity.likeCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                            <span>{activity.commentCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 수정/삭제 버튼 */}
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(activity.postId, activity.clubId)}
                        className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(activity.postId)}
                        className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 0 && (
            <div className="flex items-center justify-center gap-2 py-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="px-4 py-2">
                {currentPage}/{totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyActivities;
