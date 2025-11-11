// front/src/pages/community/PostDetail.jsx
import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {
  ChatBubbleOvalLeftIcon,
  UserCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';

import { postApi } from '../../services/api/postApi';
import { commentApi } from '../../services/api/commentApi';
import { fileApi } from '../../services/api/fileApi';
import useUserStore from '../../store/useUserStore';
import DEFAULT_PROFILE from '../../assets/images/default-profile.png';
import AlertModal from '../../components/common/AlertModal';
import ConfirmModal from '../../components/common/ConfirmModal';

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
        <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
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
  const [errorType, setErrorType] = useState(null);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    redirectTo: null,
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: '확인',
    cancelText: '취소',
    confirmButtonStyle: 'danger',
  });

  // 🆕 fileId로 조회한 이미지 URL들
  const [imageUrls, setImageUrls] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);

  const [commentLikes, setCommentLikes] = useState({});

  const getProfileSrc = (url) => {
    if (!url || url.trim() === '' || url === 'null') {
      return DEFAULT_PROFILE;
    }
    return url;
  };

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
    if (hasFetchedRef.current) return;

    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        setErrorType(null);

        const data = await postApi.getPostDetail(postId);
        setPost(data);
        setLikeCount(data.likeCount || 0);

        if (isAuthenticated) {
          const likeStatus = await postApi.getLikeStatus(postId);
          setLiked(likeStatus.liked);
        }
      } catch (err) {
        console.error('게시글 조회 실패:', err);

        if (err.status === 401) {
          setAlertModal({
            isOpen: true,
            title: '알림',
            message: '로그인 후 이용 가능합니다.',
            redirectTo: '/community',
          });
        } else if (err.status === 403) {
          setAlertModal({
            isOpen: true,
            title: '알림',
            message: '동호회 회원만 볼 수 있습니다.',
            redirectTo: '/community',
          });
        } else if (err.status === 404) {
          setErrorType('NOT_FOUND');
          setError('게시글을 찾을 수 없습니다.');
        } else {
          setError('게시글을 불러올 수 없습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        setCommentsLoading(true);
        const data = await commentApi.getComments(postId);
        setComments(data);

        // ✅ 로그인한 경우 각 댓글의 좋아요 상태 조회
        if (isAuthenticated) {
          // 모든 댓글(부모 댓글 + 대댓글)의 commentId를 수집
          const allCommentIds = [];

          data.forEach((comment) => {
            allCommentIds.push(comment.commentId);

            // 대댓글도 포함
            if (comment.replies && comment.replies.length > 0) {
              comment.replies.forEach((reply) => {
                allCommentIds.push(reply.commentId);
              });
            }
          });

          // 모든 댓글의 좋아요 상태를 조회
          const likeStatusPromises = allCommentIds.map(async (commentId) => {
            try {
              const status = await commentApi.getCommentLikeStatus(commentId);
              return { commentId, ...status };
            } catch {
              return {
                commentId,
                isLiked: false,
                likeCount: 0,
              };
            }
          });

          const likeStatuses = await Promise.all(likeStatusPromises);

          const likeStatusMap = {};
          likeStatuses.forEach((status) => {
            likeStatusMap[status.commentId] = {
              isLiked: status.liked,
              likeCount: status.likeCount,
            };
          });
          setCommentLikes(likeStatusMap);
        } else {
          // 비로그인 시 기본 좋아요 수만 표시
          const likeStatusMap = {};
          data.forEach((comment) => {
            likeStatusMap[comment.commentId] = {
              isLiked: false,
              likeCount: comment.likeCount || 0,
            };

            // 대댓글도 처리
            if (comment.replies && comment.replies.length > 0) {
              comment.replies.forEach((reply) => {
                likeStatusMap[reply.commentId] = {
                  isLiked: false,
                  likeCount: reply.likeCount || 0,
                };
              });
            }
          });
          setCommentLikes(likeStatusMap);
        }
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

  // 🆕 post.images에서 fileId를 파싱하여 실제 이미지 URL 조회
  useEffect(() => {
    const fetchImages = async () => {
      if (!post || !post.images) {
        setImageUrls([]);
        return;
      }

      try {
        setImagesLoading(true);

        // post.images는 "1/2/3" 형태의 fileId 문자열
        const fileIds = post.images
          .split('/')
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id));

        if (fileIds.length === 0) {
          setImageUrls([]);
          return;
        }

        // fileApi.getFiles()로 파일 정보 조회
        const files = await fileApi.getFiles(fileIds);

        // fileUrl만 추출하여 상태에 저장
        const urls = files.map((file) => file.fileLink).filter(Boolean);
        setImageUrls(urls);
      } catch (err) {
        console.error('이미지 조회 실패:', err);
        setImageUrls([]);
      } finally {
        setImagesLoading(false);
      }
    };

    fetchImages();
  }, [post]);

  const canManage = isAuthenticated && user && post && Number(user.id) === Number(post.createdBy);

  const closeAlert = () => {
    const redirectPath = alertModal.redirectTo;
    setAlertModal({ isOpen: false, title: '', message: '', redirectTo: null });

    if (redirectPath) {
      navigate(redirectPath);
    }
  };

  const closeConfirm = () => {
    setConfirmModal({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      confirmText: '확인',
      cancelText: '취소',
      confirmButtonStyle: 'danger',
    });
  };

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      setAlertModal({
        isOpen: true,
        title: '알림',
        message: '로그인이 필요합니다.',
        redirectTo: '/login',
      });
      return;
    }

    try {
      const result = await postApi.toggleLike(postId);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
      setAlertModal({
        isOpen: true,
        title: '오류',
        message: '좋아요 처리에 실패했습니다.',
      });
    }
  };

  const handleCommentSubmit = () => {
    if (!isAuthenticated) {
      setAlertModal({
        isOpen: true,
        title: '알림',
        message: '로그인이 필요합니다.',
        redirectTo: '/login',
      });
      return;
    }
    if (!newComment.trim()) {
      setAlertModal({
        isOpen: true,
        title: '알림',
        message: '댓글 내용을 입력해주세요.',
      });
      return;
    }

    // ✅ 확인 모달 먼저 띄우기
    setConfirmModal({
      isOpen: true,
      title: '댓글 등록',
      message: '댓글을 등록하시겠습니까?',
      confirmText: '등록',
      cancelText: '취소',
      confirmButtonStyle: 'primary',
      onConfirm: async () => {
        try {
          await commentApi.createComment(postId, {
            content: newComment,
            parentCommentId: null,
          });
          setNewComment('');
          const data = await commentApi.getComments(postId);
          setComments(data);
          setAlertModal({
            isOpen: true,
            title: '완료',
            message: '댓글이 등록되었습니다.',
          });
        } catch (err) {
          console.error('댓글 작성 실패:', err);
          setAlertModal({
            isOpen: true,
            title: '오류',
            message: '댓글 작성에 실패했습니다.',
          });
        }
      },
    });
  };

  const handleReplySubmit = (parentId) => {
    if (!isAuthenticated) {
      setAlertModal({
        isOpen: true,
        title: '알림',
        message: '로그인이 필요합니다.',
        redirectTo: '/login',
      });
      return;
    }
    if (!replyContent.trim()) {
      setAlertModal({
        isOpen: true,
        title: '알림',
        message: '댓글 내용을 입력해주세요.',
      });
      return;
    }

    // ✅ 확인 모달 먼저 띄우기
    setConfirmModal({
      isOpen: true,
      title: '답글 등록',
      message: '답글을 등록하시겠습니까?',
      confirmText: '등록',
      cancelText: '취소',
      confirmButtonStyle: 'primary',
      onConfirm: async () => {
        try {
          await commentApi.createComment(postId, {
            content: replyContent,
            parentCommentId: parentId,
          });
          setReplyContent('');
          setReplyingTo(null);
          const data = await commentApi.getComments(postId);
          setComments(data);
          setAlertModal({
            isOpen: true,
            title: '완료',
            message: '답글이 등록되었습니다.',
          });
        } catch (err) {
          console.error('대댓글 작성 실패:', err);
          setAlertModal({
            isOpen: true,
            title: '오류',
            message: '답글 작성에 실패했습니다.',
          });
        }
      },
    });
  };

  const startEdit = (comment) => {
    setEditingComment(comment.commentId);
    setEditContent(comment.content);
  };

  const handleEditSubmit = async (commentId) => {
    if (!editContent.trim()) {
      setAlertModal({
        isOpen: true,
        title: '알림',
        message: '댓글 내용을 입력해주세요.',
      });
      return;
    }

    try {
      await commentApi.updateComment(commentId, editContent);
      setEditingComment(null);
      setEditContent('');
      const data = await commentApi.getComments(postId);
      setComments(data);
      setAlertModal({
        isOpen: true,
        title: '완료',
        message: '댓글이 수정되었습니다.',
      });
    } catch (err) {
      console.error('댓글 수정 실패:', err);
      setAlertModal({
        isOpen: true,
        title: '오류',
        message: '댓글 수정에 실패했습니다.',
      });
    }
  };

  const handleCommentLikeToggle = async (commentId) => {
    if (!isAuthenticated) {
      setAlertModal({
        isOpen: true,
        title: '알림',
        message: '로그인이 필요합니다.',
        redirectTo: 'login',
      });
      return;
    }

    try {
      const result = await commentApi.toggleCommentLike(commentId);

      // 상태 업데이트
      setCommentLikes((prev) => ({
        ...prev,
        [commentId]: {
          isLiked: result.liked,
          likeCount: result.likeCount,
        },
      }));
    } catch (err) {
      console.error('댓글 좋아요 처리 실패:', err);
      setAlertModal({
        isOpen: true,
        title: '오류',
        message: '좋아요 처리에 실패했습니다.',
      });
    }
  };

  const handleDeleteComment = async (commentId) => {
    setConfirmModal({
      isOpen: true,
      title: '댓글 삭제',
      message: '이 댓글을 삭제할까요?',
      confirmText: '삭제',
      confirmButtonStyle: 'danger',
      onConfirm: async () => {
        try {
          await commentApi.deleteComment(commentId);
          setAlertModal({
            isOpen: true,
            title: '완료',
            message: '댓글이 삭제되었습니다.',
          });
          // 댓글 목록 새로고침
          const data = await commentApi.getComments(postId);
          setComments(data);

          // 로그인한 경우 댓글 좋아요 상태도 새로고침
          if (isAuthenticated) {
            // 모든 댓글(부모 댓글 + 대댓글)의 commentId를 수집
            const allCommentIds = [];

            data.forEach((comment) => {
              allCommentIds.push(comment.commentId);

              // 대댓글도 포함
              if (comment.replies && comment.replies.length > 0) {
                comment.replies.forEach((reply) => {
                  allCommentIds.push(reply.commentId);
                });
              }
            });

            const likeStatusPromises = allCommentIds.map(async (commentId) => {
              try {
                const status = await commentApi.getCommentLikeStatus(commentId);
                return { commentId, ...status };
              } catch {
                return { commentId, isLiked: false, likeCount: 0 };
              }
            });
            const likeStatuses = await Promise.all(likeStatusPromises);

            const likeMap = {};
            likeStatuses.forEach((status) => {
              likeMap[status.commentId] = {
                isLiked: status.liked,
                likeCount: status.likeCount,
              };
            });
            setCommentLikes(likeMap);
          }
        } catch (err) {
          console.error('댓글 삭제 실패:', err);
          setAlertModal({
            isOpen: true,
            title: '오류',
            message: '댓글 삭제에 실패했습니다.',
          });
        }
      },
    });
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
    setConfirmModal({
      isOpen: true,
      title: '게시글 삭제',
      message: '이 게시글을 삭제할까요?',
      confirmText: '삭제',
      confirmButtonStyle: 'danger',
      onConfirm: async () => {
        try {
          await postApi.deletePost(post.postId);
          setAlertModal({
            isOpen: true,
            title: '완료',
            message: '게시글이 삭제되었습니다.',
            redirectTo: '/community',
          });
        } catch (err) {
          console.error('게시글 삭제 실패:', err);
          setAlertModal({
            isOpen: true,
            title: '오류',
            message: '게시글 삭제에 실패했습니다.',
          });
        }
      },
    });
  };

  const totalComments = useMemo(() => {
    return comments.reduce((sum, c) => {
      const parent = c.isDeleted !== 'Y' ? 1 : 0;
      const replies = (c.replies || []).filter((r) => r.isDeleted !== 'Y').length;
      return sum + parent + replies;
    }, 0);
  }, [comments]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={closeAlert}
          title={alertModal.title}
          message={alertModal.message}
        />
        <div className="text-gray-500">게시글을 불러오는 중...</div>
      </div>
    );
  }

  // 401, 403 에러는 모달만 표시
  if (errorType === 'UNAUTHORIZED' || errorType === 'FORBIDDEN') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={closeAlert}
          title={alertModal.title}
          message={alertModal.message}
        />
      </div>
    );
  }

  // 404나 기타 에러는 에러 화면 표시
  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <div className="text-red-500 mb-4">{error || '게시글을 찾을 수 없습니다.'}</div>
        <button
          onClick={() => navigate('/community')}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          목록으로 돌아가기
        </button>
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
            <img
              src={getProfileSrc(post.profileUrl)}
              alt={post.authorNickname || '프로필'}
              className="w-10 h-10 rounded-full object-cover bg-white"
            />

            <div>
              <div className="font-semibold text-gray-800">{post.authorNickname || '익명'}</div>
              <div className="text-xs text-gray-400">
                {post.createdAt} 조회 {post.viewCount}
              </div>
            </div>
          </div>
          {canManage && <KebabMenu onEdit={goEdit} onDelete={doDelete} />}
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">{post.title}</h1>

        {/* 🆕 fileId 기반 이미지 표시 */}
        {imagesLoading ? (
          <div className="mb-6 flex items-center justify-center h-64 bg-gray-100 rounded">
            <div className="text-gray-500">이미지를 불러오는 중...</div>
          </div>
        ) : imageUrls.length > 0 ? (
          <div className="mb-6 space-y-4">
            {imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`게시글 이미지 ${index + 1}`}
                className="w-full max-w-2xl bg-gray-100"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ))}
          </div>
        ) : null}

        <div
          className="text-gray-700 mb-6 prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(post.content, sanitizeConfig),
          }}
        />

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <button onClick={handleLikeToggle} className="flex items-center gap-1 transition-colors">
            <svg
              className="w-5 h-5 transition-colors"
              fill={liked ? '#ef4444' : 'none'}
              stroke={liked ? '#ef4444' : '#9ca3af'}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{likeCount}</span>
          </button>
          <div className="flex items-center gap-1">
            <ChatBubbleOvalLeftIcon className="w-5 h-5" />
            <span>{totalComments}</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200 my-8" />

      <div className="mb-6 text-sm">
        <h2 className="text-base font-bold text-gray-800 mb-3">댓글 {totalComments}</h2>
        <div className="flex items-start gap-2">
          <UserCircleIcon className="w-6 h-6 text-gray-300 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none resize-none text-sm leading-5 placeholder:text-xs"
              rows="3"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleCommentSubmit}
                className="px-3 py-1.5 bg-[#4FA3FF] text-white text-xs rounded hover:bg-[#3d8edb] transition"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      </div>

      {commentsLoading ? (
        <div className="text-center py-4 text-gray-500">댓글을 불러오는 중...</div>
      ) : totalComments > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.commentId} className="border-b border-gray-100 pb-4">
              <div className="flex items-start gap-3">
                <img
                  src={getProfileSrc(comment.profileUrl)}
                  alt={comment.authorNickname || comment.authorName || '프로필'}
                  className="w-8 h-8 rounded-full object-cover bg-white flex-shrink-0 mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-gray-800 text-sm">
                        {comment.authorNickname || comment.authorName || '익명'}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {formatCommentDate(comment.createdAt)}
                      </span>
                    </div>

                    {isAuthenticated &&
                      user &&
                      Number(user.id) === Number(comment.createdBy) &&
                      comment.isDeleted !== 'Y' && (
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
                        rows="2"
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
                        className={`text-sm ${
                          comment.isDeleted === 'Y' ? 'text-gray-400 italic' : 'text-gray-700'
                        }`}
                      >
                        {comment.isDeleted === 'Y' ? '삭제된 댓글입니다' : comment.content}
                      </p>

                      {comment.isDeleted !== 'Y' && (
                        <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                          <button
                            onClick={() => handleCommentLikeToggle(comment.commentId)}
                            className="flex items-center gap-1 transition-colors"
                          >
                            <svg
                              className="w-4 h-4 transition-colors"
                              fill={commentLikes[comment.commentId]?.isLiked ? '#ef4444' : 'none'}
                              stroke={
                                commentLikes[comment.commentId]?.isLiked ? '#ef4444' : '#9ca3af'
                              }
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                            <span>{commentLikes[comment.commentId]?.likeCount || 0}</span>
                          </button>
                          <button
                            onClick={() => setReplyingTo(comment.commentId)}
                            className="hover:text-[#4FA3FF]"
                          >
                            답글
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {replyingTo === comment.commentId && (
                    <div className="mt-3 flex items-start gap-2">
                      <UserCircleIcon className="w-6 h-6 text-gray-300 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="댓글을 입력하세요"
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
                        <div key={reply.commentId} className="flex items-start gap-2">
                          <img
                            src={getProfileSrc(reply.profileUrl)}
                            alt={reply.authorNickname || reply.authorName || '프로필'}
                            className="w-6 h-6 rounded-full object-cover bg-white flex-shrink-0 mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <span className="font-semibold text-gray-800 text-sm">
                                  {reply.authorNickname || reply.authorName || '익명'}
                                </span>
                                <span className="text-xs text-gray-400 ml-2">
                                  {formatCommentDate(reply.createdAt)}
                                </span>
                              </div>

                              {isAuthenticated &&
                                user &&
                                Number(user.id) === Number(reply.createdBy) &&
                                reply.isDeleted !== 'Y' && (
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
                                  className={`text-sm ${
                                    reply.isDeleted === 'Y'
                                      ? 'text-gray-400 italic'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  {reply.isDeleted === 'Y' ? '삭제된 댓글입니다' : reply.content}
                                </p>

                                {reply.isDeleted !== 'Y' && (
                                  <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                                    <button
                                      onClick={() => handleCommentLikeToggle(reply.commentId)}
                                      className="flex items-center gap-1 transition-colors"
                                    >
                                      <svg
                                        className="w-4 h-4 transition-colors"
                                        fill={
                                          commentLikes[reply.commentId]?.isLiked
                                            ? '#ef4444'
                                            : 'none'
                                        }
                                        stroke={
                                          commentLikes[reply.commentId]?.isLiked
                                            ? '#ef4444'
                                            : '#9ca3af'
                                        }
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        />
                                      </svg>
                                      <span>{commentLikes[reply.commentId]?.likeCount || 0}</span>
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
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        confirmButtonStyle={confirmModal.confirmButtonStyle}
      />
    </div>
  );
}
