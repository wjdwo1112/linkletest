// src/pages/mypage/MyActivities.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// 토큰이 유효할 때만 Authorization 전송
const authHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return token && token.split('.').length === 3 ? { Authorization: `Bearer ${token}` } : {};
};

// 안전한 key
const buildKey = (a, i) =>
  a?.postId ??
  a?.commentId ??
  a?.likeLogId ??
  a?.activityId ??
  (a?.clubId != null && a?.createdAt ? `${a.clubId}-${a.createdAt}` : `row-${i}`);

const MyActivities = () => {
  const navigate = useNavigate();
  const [allActivities, setAllActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  // 'all' | 'comments' | 'likes'
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchActivities();
    setCurrentPage(1);
  }, [filterType]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // 서버가 type으로 분기 ↔ 필요하면 엔드포인트/파라미터만 바꿔
      const { data } = await axios.get(`${API_BASE_URL}/member/activities/posts`, {
        headers: { ...authHeaders() },
        params: { type: filterType },
        withCredentials: true,
      });
      const list = (data || []).map((it, idx) => ({ ...it, __key: buildKey(it, idx) }));
      setAllActivities(list);
    } catch (e) {
      console.error('활동 목록 조회 실패:', e);
      if (e?.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // 게시글 수정/삭제
  const handleEditPost = (postId, clubId) => navigate(`/clubs/${clubId}/posts/${postId}/edit`);
  const handleDeletePost = async (postId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/member/posts/${postId}`, {
        headers: { ...authHeaders() },
        withCredentials: true,
      });
      alert('삭제되었습니다.');
      fetchActivities();
    } catch (e) {
      console.error('삭제 실패:', e);
      alert('삭제에 실패했습니다.');
    }
  };

  // 댓글 수정/삭제 (엔드포인트는 프로젝트에 맞게 조정)
  const handleEditComment = (commentId, postId, clubId) => {
    // 댓글 수정 페이지가 따로 없으면, 원글로 이동 후 내부에서 수정 트리거
    navigate(`/clubs/${clubId}/posts/${postId}?editCommentId=${commentId}`);
  };
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/comments/${commentId}`, {
        headers: { ...authHeaders() },
        withCredentials: true,
      });
      fetchActivities();
    } catch (e) {
      console.error('댓글 삭제 실패:', e);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  // 좋아요 취소
  const handleUnlike = async (postId) => {
    try {
      await axios.delete(`${API_BASE_URL}/posts/${postId}/like`, {
        headers: { ...authHeaders() },
        withCredentials: true,
      });
      fetchActivities();
    } catch (e) {
      console.error('좋아요 취소 실패:', e);
      alert('좋아요 취소에 실패했습니다.');
    }
  };

  const formatDate = (s) => {
    if (!s) return '';
    const d = new Date(s);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${dd}`;
  };
  const goToPost = (clubId, postId) => navigate(`/clubs/${clubId}/posts/${postId}`);

  // 페이지네이션
  const totalPages = Math.ceil(allActivities.length / itemsPerPage) || 0;
  const start = (currentPage - 1) * itemsPerPage;
  const current = allActivities.slice(start, start + itemsPerPage);

  // ---------- 레이아웃 3종 ----------
  // 1) 전체 글
  const renderAll = () => (
    <div className="divide-y divide-gray-200">
      {current.map((a) => (
        <div key={a.__key} className="py-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3
                onClick={() => goToPost(a.clubId, a.postId)}
                className="text-lg font-medium mb-1 cursor-pointer hover:text-[#4CA8FF]"
              >
                {a.title}
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                {a.clubName && (
                  <span className="px-3 py-1 bg-[#E3F2FF] text-[#4CA8FF] rounded-full text-xs font-medium">
                    {a.clubName}
                  </span>
                )}
                <span>{formatDate(a.createdAt)}</span>
                <div className="flex items-center gap-3">
                  <Metric icon="eye" value={a.viewCount ?? 0} />
                  <Metric icon="heart" value={a.likeCount ?? 0} />
                  <Metric icon="bubble" value={a.commentCount ?? 0} />
                </div>
              </div>
            </div>
            <RowActions
              onEdit={() => handleEditPost(a.postId, a.clubId)}
              onDelete={() => handleDeletePost(a.postId)}
            />
          </div>
        </div>
      ))}
    </div>
  );

  // 2) 댓글
  const renderComments = () => (
    <div className="divide-y divide-gray-200">
      {current.map((a) => (
        <div key={a.__key} className="py-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* 내 댓글 내용 */}
              <h3 className="text-lg font-medium mb-1">{a.commentContent ?? a.title}</h3>
              <div className="text-sm text-gray-500 mb-1">
                {formatDate(a.commentedAt ?? a.createdAt)}
              </div>
              {/* 원글 제목 (파란 링크) */}
              <button
                onClick={() => goToPost(a.clubId, a.postId)}
                className="text-sm text-[#4CA8FF] hover:underline text-left"
              >
                {a.postTitle ?? a.title}
              </button>
            </div>
            {/* 우측 버튼: 댓글 수정/삭제 */}
            <RowActions
              editLabel="수정"
              deleteLabel="삭제"
              onEdit={() => handleEditComment(a.commentId, a.postId, a.clubId)}
              onDelete={() => handleDeleteComment(a.commentId)}
            />
          </div>
        </div>
      ))}
    </div>
  );

  // 3) 좋아요(테이블)
  const renderLikes = () => (
    <div className="w-full">
      {/* 헤더 */}
      <div className="grid grid-cols-[minmax(0,1fr)_160px_120px_90px_90px] px-4 py-3 text-sm text-gray-500 border-b">
        <div>제목</div>
        <div className="text-center">작성자</div>
        <div className="text-center">작성일</div>
        <div className="text-center">조회</div>
        <div className="text-center">동작</div>
      </div>

      {/* 행 */}
      {current.map((a) => (
        <div
          key={a.__key}
          className="grid grid-cols-[minmax(0,1fr)_160px_120px_90px_90px] items-center px-4 py-4 border-b"
        >
          <button
            onClick={() => goToPost(a.clubId, a.postId)}
            className="text-left hover:text-[#4CA8FF] truncate"
            title={a.title}
          >
            {a.title}
          </button>
          <div className="text-center text-[#4CA8FF]">{a.authorNickname ?? '-'}</div>
          <div className="text-center">{formatDate(a.createdAt)}</div>
          <div className="text-center">{a.viewCount ?? 0}</div>
          <div className="text-center">
            <button
              onClick={() => handleUnlike(a.postId)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-5xl">
        <h1 className="text-3xl font-extrabold mb-6">나의 활동</h1>

        {/* 필터 */}
        <div className="mb-6">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4CA8FF]"
          >
            <option value="all">전체 글</option>
            <option value="comments">댓글</option>
            <option value="likes">좋아요한 글</option>
          </select>
        </div>

        <div className="border-t-2 border-[#4CA8FF]">
          {loading ? (
            <div className="py-20 text-center text-gray-500">로딩 중...</div>
          ) : allActivities.length === 0 ? (
            <div className="py-20 text-center text-gray-500">활동 내역이 없습니다.</div>
          ) : filterType === 'all' ? (
            renderAll()
          ) : filterType === 'comments' ? (
            renderComments()
          ) : (
            renderLikes()
          )}

          {/* 페이지네이션 */}
          {totalPages > 0 && (
            <div className="flex items-center justify-center gap-2 py-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

// 공통 작은 컴포넌트
const RowActions = ({ onEdit, onDelete, editLabel = '수정', deleteLabel = '삭제' }) => (
  <div className="flex gap-2 ml-4">
    <button
      onClick={onEdit}
      className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
    >
      {editLabel}
    </button>
    <button
      onClick={onDelete}
      className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
    >
      {deleteLabel}
    </button>
  </div>
);

const Metric = ({ icon, value }) => {
  const paths = {
    eye: (
      <>
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
      </>
    ),
    heart: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    ),
    bubble: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    ),
  };

  return (
    <div className="flex items-center gap-1">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {paths[icon]}
      </svg>
      <span>{value}</span>
    </div>
  );
};

export default MyActivities;
