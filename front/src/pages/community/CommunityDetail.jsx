import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  EyeIcon,
  PhotoIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { postApi } from '../../services/api/postApi';

const DEFAULT_THUMB = 'https://via.placeholder.com/160x110/CCCCCC/FFFFFF?text=No+Image';

// 탭 라벨
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

// DB 매핑
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

// 한 번에 추가로 렌더링할 아이템 개수(= 이전의 페이지 크기)
const BATCH_SIZE = 10;

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
          loading="lazy"
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

  // 무한스크롤용 상태
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isAppending, setIsAppending] = useState(false);
  const [noMore, setNoMore] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  // 초기/탭 변경 시 데이터 로드
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

        // 탭/카테고리 바뀌면 무한스크롤 상태 리셋
        setVisibleCount(BATCH_SIZE);
        setNoMore(false);
        window.scrollTo({ top: 0, behavior: 'instant' });
      } catch (err) {
        console.error('게시글 목록 조회 실패:', err);
        setError('게시글을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [decodedTab]);

  // IntersectionObserver 세팅
  useEffect(() => {
    if (!sentinelRef.current) return;

    // 모든 아이템을 이미 보여줬으면 관찰 불필요
    if (noMore || loading) return;

    // 기존 옵저버 정리
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // 폴백: 브라우저에 IntersectionObserver가 없으면 scroll 이벤트 사용
    if (typeof IntersectionObserver === 'undefined') {
      const onScroll = () => {
        if (isAppending || noMore) return;
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 200) {
          appendMore();
        }
      };
      window.addEventListener('scroll', onScroll);
      return () => window.removeEventListener('scroll', onScroll);
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) appendMore();
      },
      {
        root: null,
        rootMargin: '400px', // 미리 로드
        threshold: 0,
      },
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCount, posts.length, noMore, loading]);

  const appendMore = () => {
    if (isAppending || noMore) return;

    setIsAppending(true);
    // 살짝의 지연을 넣어 스피너가 보이고 급격한 연속호출 방지
    setTimeout(() => {
      setVisibleCount((prev) => {
        const next = Math.min(prev + BATCH_SIZE, posts.length);
        if (next >= posts.length) setNoMore(true);
        return next;
      });
      setIsAppending(false);
    }, 250);
  };

  const handleSelectCategory = (category) => {
    navigate(`/community/${encodeURIComponent(category)}`);
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

  // 현재 화면에 보여줄 목록 (무한스크롤로 누적 노출)
  const visiblePosts = posts.slice(0, visibleCount);
  const rows = toRows(visiblePosts);

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
      {/* 카테고리 탭 */}
      <div className="mb-8">
        <div className="flex gap-2 justify-center flex-wrap">
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

      {/* 타임라인 */}
      {rows.length > 0 ? (
        <>
          {/* 게시글 영역 - 중앙 수직선 포함 */}
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 pointer-events-none" />

            <div>
              {rows.map(([left, right], idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-2 gap-x-0 py-8 ${
                    idx !== rows.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <div className="pr-8">
                    {left && (
                      <article className="grid grid-cols-[1fr_auto] gap-6">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">{left.clubName}</div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            <Link
                              to={`/community/posts/${left.postId}`}
                              className="hover:underline"
                            >
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
                            <Link
                              to={`/community/posts/${right.postId}`}
                              className="hover:underline"
                            >
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
              ))}
            </div>
          </div>

          {/* 무한스크롤 센티넬 & 상태 표시 - 게시글 영역 밖 */}
          <div ref={sentinelRef} className="h-10" />
          <div className="flex items-center justify-center py-6">
            {isAppending && (
              <div className="text-gray-400 text-sm animate-pulse">더 불러오는 중…</div>
            )}
            {!loading && noMore && (
              <div className="text-gray-400 text-sm">더 이상 게시글이 없습니다.</div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">게시글이 없습니다.</div>
      )}

      <WriteFab />
    </div>
  );
}
