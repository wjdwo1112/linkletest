import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  EyeIcon,
  PhotoIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { postApi } from '../../services/api/postApi';

const DEFAULT_THUMB = 'https://via.placeholder.com/160x110/CCCCCC/FFFFFF?text=No+Image';

const CATEGORY_LIST = [
  '전체',
  '운동/스포츠',
  '문화/예술',
  '취미',
  '자기계발',
  '푸드 드링크',
  '여행/아웃도어',
  '게임/오락',
  '외국어',
];

const CATEGORY_DB_MAP = {
  '운동/스포츠': '운동·스포츠',
  '문화/예술': '문화·예술',
  취미: '취미',
  자기계발: '자기계발',
  '푸드 드링크': '푸드·드링크',
  '여행/아웃도어': '여행·아웃도어',
  '게임/오락': '게임·오락',
  외국어: '외국어',
};

const POSTS_PER_PAGE = 10;

function Thumb({ src, alt }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <div className="relative w-[120px] h-[80px] rounded-md overflow-hidden border border-gray-200 bg-gray-100">
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={alt || ''}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgSrc(DEFAULT_THUMB)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <PhotoIcon className="w-8 h-8 text-gray-300" />
        </div>
      )}
    </div>
  );
}

function toRows(list) {
  const rows = [];
  for (let i = 0; i < list.length; i += 2) rows.push([list[i], list[i + 1] ?? null]);
  return rows;
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-12 pb-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded border ${
          currentPage === 1
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
        aria-label="이전 페이지"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {pages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
          >
            1
          </button>
          {pages[0] > 2 && <span className="text-gray-400">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded border text-sm ${
            currentPage === page
              ? 'bg-black text-white border-black'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="text-gray-400">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded border ${
          currentPage === totalPages
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
        aria-label="다음 페이지"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

function WriteFab() {
  return (
    <Link
      to="/community/write"
      aria-label="글 작성"
      className="fixed right-32 bottom-8 z-40 w-14 h-14 rounded-full bg-[#4FA3FF] text-white shadow-xl hover:brightness-105 active:scale-95 transition"
      title="글 작성"
    >
      <div className="w-full h-full flex items-center justify-center">
        <PencilSquareIcon className="w-7 h-7" />
      </div>
    </Link>
  );
}

export default function CommunityDetail() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const decodedTab = useMemo(() => (tab ? decodeURIComponent(tab) : '전체'), [tab]);

  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await postApi.getPostList();

        if (CATEGORY_LIST.includes(decodedTab)) {
          setSelectedCategory(decodedTab);

          if (decodedTab === '전체') {
            setPosts([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
          } else {
            const dbCategoryName = CATEGORY_DB_MAP[decodedTab];
            const filtered = data.filter((p) => {
              const targetCategory = p.parentCategoryName || p.categoryName;
              return targetCategory === dbCategoryName;
            });
            setPosts(filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
          }
        } else {
          setSelectedCategory('전체');
          setPosts(data);
        }

        // 카테고리 변경 시 페이지를 1로 리셋
        setCurrentPage(1);
      } catch (err) {
        console.error('게시글 목록 조회 실패:', err);
        setError('게시글을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [decodedTab]);

  const handleSelectCategory = (category) => {
    navigate(`/community/${encodeURIComponent(category)}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString) => {
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

  const getFirstImage = (imagesString) => {
    if (!imagesString) return null;
    const images = imagesString.split(',').filter((img) => img.trim());
    return images.length > 0 ? images[0] : null;
  };

  // 페이지네이션 계산
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, endIndex);
  const rows = toRows(currentPosts);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 text-center">
        <div className="text-gray-500">게시글을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 text-center">
        <div className="text-red-500">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#4FA3FF] text-white rounded hover:bg-[#3d8edb]"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <div className="mb-8">
        <div className="flex gap-2 justify-center">
          {CATEGORY_LIST.map((cat) => {
            const selected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleSelectCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selected
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
                aria-pressed={selected}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 pointer-events-none" />

        <div>
          {rows.length > 0 ? (
            rows.map(([left, right], idx) => (
              <div key={idx} className="grid grid-cols-2 gap-x-0 py-8 border-b border-gray-200">
                <div className="pr-8">
                  {left && (
                    <article className="grid grid-cols-[1fr_auto] gap-6">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">{left.clubName}</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          <Link to={`/community/posts/${left.postId}`} className="hover:underline">
                            {left.title}
                          </Link>
                        </h3>
                        <div className="text-sm text-gray-500 flex items-center gap-4">
                          <span className="font-medium text-gray-800">
                            {left.authorNickname || left.authorName || '익명'}
                          </span>
                          <span>{formatDate(left.createdAt)}</span>
                          <span className="flex items-center gap-1">
                            <EyeIcon className="w-4 h-4" />
                            {left.viewCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <HeartIcon className="w-4 h-4" />
                            {left.likeCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <ChatBubbleOvalLeftIcon className="w-4 h-4" />
                            {left.commentCount || 0}
                          </span>
                        </div>
                      </div>
                      <Thumb src={getFirstImage(left.images)} alt={left.title} />
                    </article>
                  )}
                </div>

                <div className="pl-8">
                  {right && (
                    <article className="grid grid-cols-[1fr_auto] gap-6">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">{right.clubName}</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          <Link to={`/community/posts/${right.postId}`} className="hover:underline">
                            {right.title}
                          </Link>
                        </h3>
                        <div className="text-sm text-gray-500 flex items-center gap-4">
                          <span className="font-medium text-gray-800">
                            {right.authorNickname || right.authorName || '익명'}
                          </span>
                          <span>{formatDate(right.createdAt)}</span>
                          <span className="flex items-center gap-1">
                            <EyeIcon className="w-4 h-4" />
                            {right.viewCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <HeartIcon className="w-4 h-4" />
                            {right.likeCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <ChatBubbleOvalLeftIcon className="w-4 h-4" />
                            {right.commentCount || 0}
                          </span>
                        </div>
                      </div>
                      <Thumb src={getFirstImage(right.images)} alt={right.title} />
                    </article>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">게시글이 없습니다.</div>
          )}
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <WriteFab />
    </div>
  );
}
