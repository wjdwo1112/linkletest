// front/src/pages/community/PostDetail.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  UserCircleIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
  HeartIcon,
  ChatBubbleOvalLeftIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { postApi } from '../../services/api/postApi';
import { commentApi } from '../../services/api/commentApi';
import useUserStore from '../../store/useUserStore';

function BigImage({ src, alt }) {
  if (!src) return null;

  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto rounded-md overflow-hidden border border-gray-200 bg-gray-100">
      {!error ? (
        <img
          src={imgSrc}
          alt={alt || ''}
          className="w-full h-auto object-cover"
          onError={() => {
            setError(true);
            setImgSrc('https://via.placeholder.com/800x600/CCCCCC/FFFFFF?text=No+Image');
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-64">
          <span className="text-gray-400">이미지를 불러올 수 없습니다</span>
        </div>
      )}
    </div>
  );
}

function KebabMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handle = () => setOpen(false);
    window.addEventListener('click', handle);
    return () => window.removeEventListener('click', handle);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : 'false'}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        <EllipsisHorizontalIcon className="w-5 h-5" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 w-32 rounded-md border border-gray-200 bg-white shadow-lg z-50"
          onClick={(e) => e.stopPropagation()}
        >
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

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserStore();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;

    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await postApi.getPostDetail(postId);
        setPost(data);
        setLikeCount(data.likeCount || 0);

        // 로그인한 경우에만 좋아요 상태 조회
        if (isAuthenticated) {
          try {
            const likeStatus = await postApi.getLikeStatus(postId);
            setLiked(likeStatus.isLiked || false);
          } catch (err) {
            console.error('좋아요 상태 조회 실패:', err);
            // 좋아요 상태 조회 실패는 무시 (로그인 필요)
          }
        }
      } catch (err) {
        console.error('게시글 상세 조회 실패:', err);
        setError('게시글을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        setCommentsLoading(true);
        const data = await commentApi.getComments(postId);
        setComments(data);
      } catch (err) {
        console.error('댓글 목록 조회 실패:', err);
      } finally {
        setCommentsLoading(false);
      }
    };

    if (postId) {
      fetchPostDetail();
      fetchComments();
      hasFetchedRef.current = true;
    }

    return () => {
      hasFetchedRef.current = false;
    };
  }, [postId, isAuthenticated]);

  const canManage = isAuthenticated && user && post && user.memberId === post.createdBy;

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const result = await postApi.toggleLike(postId);
      setLiked(result.isLiked);
      setLikeCount(result.likeCount);
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  const handleSubmit = () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    if (!comment.trim()) return;
    alert('댓글 기능은 추후 구현 예정입니다.');
    setComment('');
  };

  const formatCommentDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const goEdit = () => {
    navigate(`/community/write?edit=${post.postId}`);
  };

  const doDelete = async () => {
    const ok = window.confirm('이 게시글을 삭제할까요?');
    if (!ok) return;

    try {
      await postApi.deletePost(post.postId);
      alert('게시글이 삭제되었습니다.');
      navigate('/community');
    } catch (err) {
      console.error('게시글 삭제 실패:', err);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <div className="text-gray-500">게시글을 불러오는 중...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <div className="text-red-500">{error || '게시글을 찾을 수 없습니다.'}</div>
        <button
          onClick={() => navigate('/community')}
          className="mt-4 px-4 py-2 bg-[#4FA3FF] text-white rounded hover:bg-[#3d8edb]"
        >
          목록으로
        </button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseImages = (imagesString) => {
    if (!imagesString) return [];
    try {
      return imagesString.split(',').filter((img) => img.trim());
    } catch {
      return [];
    }
  };

  const images = parseImages(post.images);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="text-sm text-gray-400 mb-2">
        <Link to="/community" className="hover:underline text-gray-500">
          커뮤니티
        </Link>{' '}
        &gt; <span className="text-gray-700">{post.clubName}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCircleIcon className="w-6 h-6 text-gray-300" />
          <div className="text-sm">
            <div className="text-gray-800">{post.authorNickname || post.authorName || '익명'}</div>
            <div className="text-gray-400">
              {formatDate(post.createdAt)} <span className="mx-1">·</span> 조회{' '}
              {post.viewCount || 0}
            </div>
          </div>
        </div>

        {canManage && <KebabMenu onEdit={goEdit} onDelete={doDelete} />}
      </div>

      <div className="h-px bg-gray-200 my-4" />

      {images.length > 0 && <BigImage src={images[0]} alt={post.title} />}

      <div className="mt-6 space-y-4">
        <div className="text-gray-800 whitespace-pre-wrap">{post.content}</div>
      </div>

      <div className="mt-8 flex items-center gap-6 text-sm text-gray-600">
        <button
          onClick={handleLikeToggle}
          className="flex items-center gap-1 hover:text-red-500 transition"
        >
          {liked ? (
            <HeartSolid className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5" />
          )}
          <span>{likeCount}</span>
        </button>
        <div className="flex items-center gap-1">
          <ChatBubbleOvalLeftIcon className="w-5 h-5" />
          <span>{post.commentCount || 0}</span>
        </div>
      </div>

      <div className="h-px bg-gray-200 my-8" />

      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">댓글 {post.commentCount || 0}</h2>
        <div className="flex items-start gap-2">
          <UserCircleIcon className="w-8 h-8 text-gray-300 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none resize-none"
              rows="3"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#4FA3FF] text-white text-sm rounded hover:bg-[#3d8edb] transition"
              >
                등록
              </button>
            </div>
          </div>
        </div>

        {commentsLoading ? (
          <div className="text-center py-4 text-gray-500">댓글을 불러오는 중...</div>
        ) : comments.length > 0 ? (
          <div className="mt-6 space-y-4">
            {comments.map((commentItem) => (
              <div key={commentItem.commentId} className="border-t pt-4">
                <div className="flex items-start gap-2">
                  <UserCircleIcon className="w-8 h-8 text-gray-300 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-800">
                        {commentItem.authorNickname || commentItem.authorName || '익명'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatCommentDate(commentItem.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {commentItem.content}
                    </p>

                    {commentItem.replies && commentItem.replies.length > 0 && (
                      <div className="mt-3 ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
                        {commentItem.replies.map((reply) => (
                          <div key={reply.commentId} className="flex items-start gap-2">
                            <UserCircleIcon className="w-6 h-6 text-gray-300 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-gray-800">
                                  {reply.authorNickname || reply.authorName || '익명'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatCommentDate(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400 text-center mt-6">아직 댓글이 없습니다.</div>
        )}
      </div>

      <div className="text-sm text-gray-400 text-center mt-12">
        댓글 작성 기능은 추후 구현 예정입니다.
      </div>
    </div>
  );
}
