// front/src/pages/community/PostDetail.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  UserCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { postApi } from '../../services/api/postApi';
import { commentApi } from '../../services/api/commentApi';
import useUserStore from '../../store/useUserStore';

function KebabMenu({ onEdit, onDelete }) {
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

  return (
    <div className="relative" ref={menuRef}>
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
          className="absolute right-0 top-8 w-28 rounded-md border border-gray-200 bg-white shadow-lg z-50"
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
  const { isAuthenticated, user } = useUserStore();
  const hasFetchedRef = useRef(false);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (hasFetchedRef.current) return;

    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        const data = await postApi.getPostDetail(postId);
        setPost(data);
        setLikeCount(data.likeCount || 0);

        if (isAuthenticated) {
          const likeStatus = await postApi.getLikeStatus(postId);
          setLiked(likeStatus.isLiked);
        }
      } catch (err) {
        console.error('게시글 조회 실패:', err);
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

  const canManage = isAuthenticated && user && post && Number(user.id) === Number(post.createdBy);

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

  const handleCommentSubmit = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      await commentApi.createComment(postId, {
        content: newComment,
        parentCommentId: null,
      });
      setNewComment('');
      const data = await commentApi.getComments(postId);
      setComments(data);
      alert('댓글이 등록되었습니다.');
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleReplySubmit = async (parentId) => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    if (!replyContent.trim()) {
      alert('대댓글 내용을 입력해주세요.');
      return;
    }

    try {
      await commentApi.createComment(postId, {
        content: replyContent,
        parentCommentId: parentId,
      });
      setReplyContent('');
      setReplyingTo(null);
      const data = await commentApi.getComments(postId);
      setComments(data);
      alert('대댓글이 등록되었습니다.');
    } catch (err) {
      console.error('대댓글 작성 실패:', err);
      alert('대댓글 작성에 실패했습니다.');
    }
  };

  const startEdit = (comment) => {
    setEditingComment(comment.commentId);
    setEditContent(comment.content);
  };

  const handleEditSubmit = async (commentId) => {
    if (!editContent.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      await commentApi.updateComment(commentId, editContent);
      setEditingComment(null);
      setEditContent('');
      const data = await commentApi.getComments(postId);
      setComments(data);
      alert('댓글이 수정되었습니다.');
    } catch (err) {
      console.error('댓글 수정 실패:', err);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    const ok = window.confirm('이 댓글을 삭제하시겠습니까?');
    if (!ok) return;

    try {
      await commentApi.deleteComment(commentId);
      const data = await commentApi.getComments(postId);
      setComments(data);
      alert('댓글이 삭제되었습니다.');
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const formatCommentDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}`;
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
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <button onClick={() => navigate('/community')} className="hover:text-[#4FA3FF]">
          커뮤니티
        </button>
      </div>

      <div className="bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <UserCircleIcon className="w-10 h-10 text-gray-300" />
            <div>
              <div className="font-semibold text-gray-800">{post.authorNickName || '익명'}</div>
              <div className="text-xs text-gray-400">
                {post.createdAt} 조회 {post.viewCount}
              </div>
            </div>
          </div>
          {canManage && <KebabMenu onEdit={goEdit} onDelete={doDelete} />}
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">{post.title}</h1>

        {post.imageUrl && (
          <div className="mb-6">
            <img src={post.imageUrl} alt="게시글 이미지" className="w-full max-w-2xl" />
          </div>
        )}

        <div className="text-gray-700 whitespace-pre-wrap mb-6">{post.content}</div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
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
            <span>{comments.length}</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200 my-8" />

      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">댓글 {comments.length}</h2>
        <div className="flex items-start gap-2">
          <UserCircleIcon className="w-8 h-8 text-gray-300 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none resize-none"
              rows="3"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleCommentSubmit}
                className="px-4 py-2 bg-[#4FA3FF] text-white text-sm rounded hover:bg-[#3d8edb] transition"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      </div>

      {commentsLoading ? (
        <div className="text-center py-4 text-gray-500">댓글을 불러오는 중...</div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.commentId} className="border-b border-gray-100 pb-6 last:border-b-0">
              <div className="flex items-start gap-2">
                <UserCircleIcon className="w-8 h-8 text-gray-300 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-800">
                        {comment.authorNickname || '익명'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatCommentDate(comment.createdAt)}
                      </span>
                    </div>
                    {comment.isDeleted !== 'Y' &&
                      isAuthenticated &&
                      user &&
                      Number(user.id) === Number(comment.createdBy) && (
                        <KebabMenu
                          onEdit={() => startEdit(comment)}
                          onDelete={() => handleDeleteComment(comment.commentId)}
                        />
                      )}
                  </div>

                  {editingComment === comment.commentId ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none resize-none"
                        rows="3"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleEditSubmit(comment.commentId)}
                          className="px-3 py-1 bg-[#4FA3FF] text-white text-sm rounded hover:bg-[#3d8edb]"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => {
                            setEditingComment(null);
                            setEditContent('');
                          }}
                          className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p
                        className={`text-sm ${comment.isDeleted === 'Y' ? 'text-gray-400 italic' : 'text-gray-700'}`}
                      >
                        {comment.isDeleted === 'Y' ? '삭제된 댓글입니다' : comment.content}
                      </p>

                      {comment.isDeleted !== 'Y' && (
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <button className="flex items-center gap-1 hover:text-red-500">
                            <HeartIcon className="w-4 h-4" />
                            {comment.likeCount || 0}
                          </button>
                          <div className="flex items-center gap-1">
                            <ChatBubbleOvalLeftIcon className="w-4 h-4" />
                            {comment.commentCount || 0}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {editingComment !== comment.commentId && comment.isDeleted !== 'Y' && (
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      <button
                        onClick={() => setReplyingTo(comment.commentId)}
                        className="hover:text-[#4FA3FF]"
                      >
                        답글
                      </button>
                    </div>
                  )}

                  {comment.isDeleted !== 'Y' && replyingTo === comment.commentId && (
                    <div className="mt-3 ml-6 flex items-start gap-2">
                      <UserCircleIcon className="w-6 h-6 text-gray-300 flex-shrink-0" />
                      <div className="flex-1">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="대댓글을 입력하세요"
                          className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none resize-none"
                          rows="2"
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => handleReplySubmit(comment.commentId)}
                            className="px-3 py-1 bg-[#4FA3FF] text-white text-sm rounded hover:bg-[#3d8edb]"
                          >
                            등록
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent('');
                            }}
                            className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 ml-6 space-y-4 pl-4 pt-3 border-t border-gray-100">
                      {comment.replies.map((reply) => (
                        <div
                          key={reply.commentId}
                          className="border-b border-gray-100 pb-4 last:border-b-0 flex items-start gap-2"
                        >
                          <UserCircleIcon className="w-6 h-6 text-gray-300 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-gray-800">
                                  {reply.authorNickname || '익명'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatCommentDate(reply.createdAt)}
                                </span>
                              </div>
                              {reply.isDeleted !== 'Y' &&
                                isAuthenticated &&
                                user &&
                                Number(user.id) === Number(reply.createdBy) && (
                                  <KebabMenu
                                    onEdit={() => startEdit(reply)}
                                    onDelete={() => handleDeleteComment(reply.commentId)}
                                  />
                                )}
                            </div>

                            {editingComment === reply.commentId ? (
                              <div>
                                <textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none resize-none"
                                  rows="2"
                                />
                                <div className="mt-2 flex gap-2">
                                  <button
                                    onClick={() => handleEditSubmit(reply.commentId)}
                                    className="px-3 py-1 bg-[#4FA3FF] text-white text-sm rounded hover:bg-[#3d8edb]"
                                  >
                                    수정
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingComment(null);
                                      setEditContent('');
                                    }}
                                    className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50"
                                  >
                                    취소
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p
                                  className={`text-sm ${reply.isDeleted === 'Y' ? 'text-gray-400 italic' : 'text-gray-700'}`}
                                >
                                  {reply.isDeleted === 'Y' ? '삭제된 댓글입니다' : reply.content}
                                </p>

                                {reply.isDeleted !== 'Y' && (
                                  <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                                    <button className="flex items-center gap-1 hover:text-red-500">
                                      <HeartIcon className="w-4 h-4" />
                                      {reply.likeCount || 0}
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
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
        <div className="text-center py-8 text-gray-500">첫 댓글을 작성해보세요!</div>
      )}
    </div>
  );
}
