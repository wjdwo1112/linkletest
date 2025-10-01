import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  EllipsisHorizontalIcon,
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  EyeIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
  PhotoIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

/** 공용 목업 */
const DEFAULT_THUMB = 'https://picsum.photos/1200/800?grayscale&blur=1';
const MOCK_POSTS = [
  {
    id: 1,
    authorId: 100, // ⬅ 작성자 식별자(목업)
    category: '외국어',
    title: '영어 스피킹 스터디 신규 모집',
    authorName: '링클 잉글리시',
    authorRole: '운영진',
    createdAt: '2025.09.10 11:45',
    views: 120,
    likes: 12,
    commentsCount: 4,
    imageUrl: DEFAULT_THUMB,
    content: ['주 2회 저녁 8시에 온라인으로 진행합니다.', '관심 있으신 분들 연락주세요!'],
    comments: [],
  },
  {
    id: 2,
    authorId: 200,
    category: '운동/스포츠',
    title: '한강 러닝 모임 코스 공유',
    authorName: '러닝크루',
    authorRole: '매니저',
    createdAt: '2025.09.10 11:40',
    views: 77,
    likes: 9,
    commentsCount: 3,
    imageUrl: DEFAULT_THUMB,
    content: ['용산→여의도 8km, 뷰가 좋아요.', '수/금 저녁에 같이 뛰어요!'],
    comments: [],
  },
  {
    id: 3,
    authorId: 300,
    category: '문화/예술',
    title: '전시회 같이 가실 분',
    authorName: '아트워크',
    authorRole: '회원',
    createdAt: '2025.09.10 10:50',
    views: 64,
    likes: 6,
    commentsCount: 1,
    imageUrl: '',
    content: ['주말 오후에 서촌 신작전시 보러 가요.', '3~4명 소규모로!'],
    comments: [],
  },
];

function BigImage({ src, alt }) {
  if (!src) {
    return (
      <div className="w-full h-[360px] bg-gray-200 rounded-sm border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
        <div className="flex items-center gap-2">
          <PhotoIcon className="w-6 h-6" />
          이미지
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-[360px] rounded-sm overflow-hidden border border-gray-200 bg-gray-100">
      <img
        src={src}
        alt={alt || ''}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = DEFAULT_THUMB;
        }}
      />
    </div>
  );
}

function CommentItem({ item }) {
  return (
    <div className="border border-gray-200 rounded-md p-4">
      <div className="flex items-start gap-3">
        <UserCircleIcon className="w-8 h-8 text-gray-300" />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-gray-800">{item.authorName}</span>
          </div>
          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{item.content}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
            <span>{item.createdAt}</span>
            <span className="inline-flex items-center gap-1">
              <HeartIcon className="w-4 h-4" /> {item.likes}
            </span>
            <span className="inline-flex items-center gap-1">
              <ChatBubbleOvalLeftIcon className="w-4 h-4" /> {item.replies}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ─────────────────────────────
 *  overflow(⋯) 드롭다운 메뉴
 *  ───────────────────────────── */
function KebabMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        className="p-2 rounded-full hover:bg-gray-50 text-gray-500"
        title="더보기"
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : 'false'}
        onClick={() => setOpen(!open)}
      >
        <EllipsisHorizontalIcon className="w-5 h-5" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 w-32 rounded-md border border-gray-200 bg-white shadow-lg z-50"
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

/** 상세 페이지 */
export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();

  // 로그인 유저(목업)
  const currentUser = { id: 100, role: 'member', name: '링클 잉글리시' }; // authorId가 100인 글만 수정/삭제 가능

  const post = useMemo(
    () => MOCK_POSTS.find((p) => String(p.id) === String(postId)) ?? MOCK_POSTS[0],
    [postId],
  );

  const canManage =
    currentUser && (currentUser.id === post.authorId || currentUser.role === 'admin');

  const [comment, setComment] = useState('');
  const [commentList, setCommentList] = useState(post.comments || []);

  useEffect(() => {
    setCommentList(post.comments || []);
  }, [postId, post]);

  const handleSubmit = () => {
    if (!comment.trim()) return;
    const newItem = {
      id: Date.now(),
      authorName: '회원이름',
      content: comment.trim(),
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      likes: 0,
      replies: 0,
    };
    setCommentList([newItem, ...commentList]);
    setComment('');
  };

  const goEdit = () => {
    // 편집 라우트 예시: 글쓰기 화면을 편집모드로 재사용 (쿼리로 postId 전달)
    navigate(`/community/write?edit=${post.id}`);
  };

  const doDelete = () => {
    const ok = window.confirm('이 게시글을 삭제할까요?');
    if (!ok) return;
    // TODO: 백엔드 연동 시 삭제 API 호출
    // await api.delete(`/community/posts/${post.id}`);
    window.alert('현재는 데모입니다. 삭제 API 연동 시 실제로 삭제하세요.');
    navigate(`/community/${encodeURIComponent(post.category)}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* 브레드크럼브 */}
      <div className="text-sm text-gray-400 mb-2">
        <Link
          to={`/community/${encodeURIComponent(post.category)}`}
          className="hover:underline text-gray-500"
        >
          {post.category}
        </Link>{' '}
        &gt;
      </div>

      {/* 제목/작성자 + 더보기 */}
      <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCircleIcon className="w-6 h-6 text-gray-300" />
          <div className="text-sm">
            <div className="text-gray-800">{post.authorName}</div>
            <div className="text-gray-400">
              {post.createdAt} <span className="mx-1">·</span> 조회 {post.views}
            </div>
          </div>
        </div>

        {/* 작성자(혹은 관리자)에게만 노출 */}
        {canManage ? (
          <KebabMenu onEdit={goEdit} onDelete={doDelete} />
        ) : (
          <span className="inline-block w-5 h-5" /> // 자리 맞춤 (옵션)
        )}
      </div>

      {/* 구분선 */}
      <div className="h-px bg-gray-200 my-4" />

      {/* 본문 */}
      <BigImage src={post.imageUrl} alt={post.title} />
      <div className="mt-6 space-y-4">
        {post.content.map((line, idx) =>
          line ? (
            <p key={idx} className="text-gray-800 leading-7 text-[15px]">
              {line}
            </p>
          ) : (
            <div key={idx} className="h-4" />
          ),
        )}
      </div>

      {/* 요약 */}
      <div className="mt-6 flex items-center gap-6 text-gray-400 text-sm">
        <span className="inline-flex items-center gap-1">
          <HeartIcon className="w-4 h-4" /> {post.likes}
        </span>
        <span className="inline-flex items-center gap-1">
          <ChatBubbleOvalLeftIcon className="w-4 h-4" /> {post.commentsCount}
        </span>
        <span className="inline-flex items-center gap-1">
          <EyeIcon className="w-4 h-4" /> {post.views}
        </span>
      </div>

      {/* 구분선 */}
      <div className="h-px bg-gray-200 my-8" />

      {/* 댓글 */}
      <h2 className="text-sm font-semibold text-gray-700 mb-3">댓글 {commentList.length}</h2>

      {/* 입력 */}
      <div className="border border-gray-300 rounded-md">
        <div className="p-4 flex items-start gap-3">
          <UserCircleIcon className="w-7 h-7 text-gray-300" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-800">회원이름</div>
            <textarea
              className="mt-2 w-full h-[80px] resize-none outline-none bg-white placeholder:text-gray-400 text-sm p-2 border border-gray-200 rounded"
              placeholder="댓글을 남겨보세요"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
        <div className="px-4 pb-4 flex justify-end">
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-1 px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            등록
          </button>
        </div>
      </div>

      {/* 리스트 */}
      <div className="mt-4 space-y-3">
        {commentList.map((c) => (
          <CommentItem key={c.id} item={c} />
        ))}
      </div>

      <div className="py-10" />
    </div>
  );
}
