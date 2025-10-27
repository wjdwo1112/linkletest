import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  EyeIcon,
  PencilSquareIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { postApi } from '../../services/api/postApi';
import { fileApi } from '../../services/api/fileApi';
import { clubApi } from '../../services/api/clubApi';
import useUserStore from '../../store/useUserStore';

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

const BATCH_SIZE = 10;

/** 이미지 컨테이너 (썸네일 있을 때만 사용) */
function ThumbBox({ children }) {
  return (
    <div className="relative w-[132px] h-[96px] rounded-md overflow-hidden border border-gray-200 bg-gray-100">
      {children}
    </div>
  );
}

/** 실제 이미지만 렌더. 실패/없음 => 렌더 X */
function Thumb({ src, alt }) {
  const [imgSrc, setImgSrc] = useState(src);
  useEffect(() => setImgSrc(src), [src]);

  if (!imgSrc) return null;
  return (
    <img
      src={imgSrc}
      alt={alt || ''}
      className="absolute inset-0 w-full h-full object-cover"
      onError={() => setImgSrc(null)}
      loading="lazy"
    />
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

/** images("1/2/3" 등)에서 첫 숫자만 안전하게 추출 */
function parseFirstFileId(imagesString) {
  if (!imagesString) return null;
  const matches = String(imagesString).match(/\d+/g);
  if (!matches || matches.length === 0) return null;
  const id = parseInt(matches[0], 10);
  return Number.isInteger(id) ? id : null;
}

export default function CommunityDetail() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const decodedTab = useMemo(() => (tab ? decodeURIComponent(tab) : '전체'), [tab]);

  const { isAuthenticated: isLoggedIn } = useUserStore();

  // 가입 동호회 필터용
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [selectedClubIds, setSelectedClubIds] = useState([]); // 다중 선택
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState('전체');

  // 전체 원본 / 필터링 결과 분리
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 썸네일
  const [thumbnailMap, setThumbnailMap] = useState(new Map());

  // 무한스크롤
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isAppending, setIsAppending] = useState(false);
  const [noMore, setNoMore] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  // ===== 데이터 로딩 (게시글 + 가입동호회) =====
  useEffect(() => {
    let cancelled = false;

    const fetchBase = async () => {
      try {
        setLoading(true);
        setError(null);
        setAllPosts([]);
        setThumbnailMap(new Map());
        setVisibleCount(BATCH_SIZE);
        setNoMore(false);

        const [all, clubs] = await Promise.allSettled([
          postApi.getPostList(),
          isLoggedIn ? clubApi.getJoinedClubs() : Promise.resolve([]),
        ]);

        if (cancelled) return;

        if (all.status === 'fulfilled') {
          const posts = all.value || [];
          // 최신순 정렬
          posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setAllPosts(posts);
        } else {
          throw all.reason;
        }

        if (clubs.status === 'fulfilled') {
          setJoinedClubs(clubs.value || []);
        } else {
          setJoinedClubs([]);
        }

        // 카테고리 탭 반영
        if (CATEGORY_LIST.includes(decodedTab)) {
          setSelectedCategory(decodedTab);
        } else {
          setSelectedCategory('전체');
        }

        window.scrollTo({ top: 0, behavior: 'instant' });
      } catch (err) {
        if (!cancelled) {
          console.error('게시글 목록 조회 실패:', err);
          setError('게시글을 불러올 수 없습니다.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBase();
    return () => {
      cancelled = true;
    };
    // decodedTab이 바뀔 때마다 목록 리셋 느낌 유지
  }, [decodedTab, isLoggedIn]);

  // ===== 외부 클릭 시 필터 드롭다운 닫기 =====
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setShowFilterDropdown(false);
      }
    };
    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFilterDropdown]);

  // ===== 필터링 (카테고리 + 선택 동호회) =====
  const filteredPosts = useMemo(() => {
    let base = allPosts;

    // 1) 카테고리
    if (selectedCategory && selectedCategory !== '전체') {
      const dbCategoryName = CATEGORY_DB_MAP[selectedCategory];
      base = base.filter((p) => {
        const target = p.parentCategoryName || p.categoryName;
        return target === dbCategoryName;
      });
    }

    // 2) 가입 동호회
    if (selectedClubIds.length > 0) {
      const set = new Set(selectedClubIds);
      base = base.filter((p) => set.has(p.clubId));
    }

    return base;
  }, [allPosts, selectedCategory, selectedClubIds]);

  // ===== 썸네일 병렬 로딩 (필터링 결과 기준) =====
  useEffect(() => {
    let cancelled = false;

    const fetchThumbs = async () => {
      if (!filteredPosts || filteredPosts.length === 0) {
        setThumbnailMap(new Map());
        return;
      }

      const pairs = filteredPosts
        .map((p) => ({ postId: p.postId, fileId: parseFirstFileId(p.images) }))
        .filter((x) => Number.isInteger(x.fileId) && x.fileId > 0);

      const results = await Promise.allSettled(
        pairs.map(({ postId, fileId }) =>
          fileApi.getFile(fileId).then((res) => ({ postId, link: res?.fileLink || null })),
        ),
      );

      if (cancelled) return;

      const map = new Map();
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value?.link) {
          map.set(r.value.postId, r.value.link);
        }
      });
      setThumbnailMap(map);
    };

    // 썸네일 로딩 이전에 페이징 상태 리셋
    setVisibleCount(BATCH_SIZE);
    setNoMore(false);
    fetchThumbs();

    return () => {
      cancelled = true;
    };
  }, [filteredPosts]);

  // ===== 무한스크롤 설정 (filteredPosts 기준) =====
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (noMore || loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (typeof IntersectionObserver === 'undefined') {
      const onScroll = () => {
        if (isAppending || noMore) return;
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 200) appendMore();
      };
      window.addEventListener('scroll', onScroll);
      return () => window.removeEventListener('scroll', onScroll);
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) appendMore();
      },
      { root: null, rootMargin: '400px', threshold: 0 },
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [visibleCount, filteredPosts.length, noMore, loading, isAppending]);

  const appendMore = () => {
    if (isAppending || noMore) return;
    setIsAppending(true);
    setTimeout(() => {
      setVisibleCount((prev) => {
        const next = Math.min(prev + BATCH_SIZE, filteredPosts.length);
        if (next >= filteredPosts.length) setNoMore(true);
        return next;
      });
      setIsAppending(false);
    }, 250);
  };

  const handleSelectCategory = (category) => {
    navigate(`/community/${encodeURIComponent(category)}`);
  };

  const handleFilterClick = (clubId) => {
    if (clubId === null) {
      // 전체 보기
      setSelectedClubIds([]);
      setShowFilterDropdown(false);
      return;
    }
    setSelectedClubIds((prev) =>
      prev.includes(clubId) ? prev.filter((id) => id !== clubId) : [...prev, clubId],
    );
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
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const getThumbnailUrl = (postId) => thumbnailMap.get(postId) || null;

  const visiblePosts = filteredPosts.slice(0, visibleCount);
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
      {/* 상단: 카테고리 탭 + 가입동호회 필터 버튼 */}
      <div className="mb-6 flex items-center justify-between gap-4">
        {/* 카테고리 탭 */}
        <div className="flex-1">
          <div className="flex gap-2 justify-center flex-wrap">
            {CATEGORY_LIST.map((cat) => {
              const selected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleSelectCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selected
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-600 border border-gray-600 hover:bg-gray-50'
                  }`}
                  aria-pressed={selected}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 가입동호회 필터 (로그인 + 가입 동호회 있을 때만) */}
        {isLoggedIn && joinedClubs.length > 0 && (
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setShowFilterDropdown((v) => !v)}
              className="bg-white border border-gray-600 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Bars3Icon className="w-8 h-8" />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => handleFilterClick(null)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                    selectedClubIds.length === 0
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  전체 보기
                </button>
                <div className="h-px bg-gray-100" />

                {joinedClubs.map((club) => (
                  <button
                    key={club.clubId}
                    onClick={() => handleFilterClick(club.clubId)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                      selectedClubIds.includes(club.clubId)
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700'
                    }`}
                  >
                    <span className="truncate">{club.name}</span>
                    {selectedClubIds.includes(club.clubId) && (
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 타임라인 */}
      {rows.length > 0 ? (
        <>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 pointer-events-none" />
            <div>
              {rows.map(([left, right], idx) => {
                const leftUrl = left ? getThumbnailUrl(left.postId) : null;
                const rightUrl = right ? getThumbnailUrl(right.postId) : null;

                return (
                  <div
                    key={idx}
                    className={`grid grid-cols-2 gap-x-0 py-8 ${
                      idx !== rows.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    {/* LEFT */}
                    <div className="pr-8">
                      {left && (
                        <article
                          className={`grid ${leftUrl ? 'grid-cols-[1fr_auto] gap-6' : 'grid-cols-1'}`}
                        >
                          <div>
                            <div className="text-sm text-gray-500 mb-2">{left.clubName}</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 break-words">
                              <Link
                                to={`/community/posts/${left.postId}`}
                                className="hover:underline"
                              >
                                {left.title}
                              </Link>
                            </h3>
                            <div className="text-sm text-gray-500 flex items-center gap-4 flex-wrap">
                              <span className="font-medium text-gray-800 flex-shrink-0">
                                {left.authorNickname || left.authorName || '익명'}
                              </span>
                              <span>{formatDate(left.createdAt)}</span>
                              <div className="flex items-center gap-3 flex-shrink-0">
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
                          </div>
                          {leftUrl && (
                            <ThumbBox>
                              <Thumb src={leftUrl} alt={left.title} />
                            </ThumbBox>
                          )}
                        </article>
                      )}
                    </div>

                    {/* RIGHT */}
                    <div className="pl-8">
                      {right && (
                        <article
                          className={`grid ${rightUrl ? 'grid-cols-[1fr_auto] gap-6' : 'grid-cols-1'}`}
                        >
                          <div>
                            <div className="text-sm text-gray-500 mb-1">{right.clubName}</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 break-words">
                              <Link
                                to={`/community/posts/${right.postId}`}
                                className="hover:underline"
                              >
                                {right.title}
                              </Link>
                            </h3>
                            <div className="text-sm text-gray-500 flex items-center gap-4 flex-wrap">
                              <span className="font-medium text-gray-800 flex-shrink-0">
                                {right.authorNickname || right.authorName || '익명'}
                              </span>
                              <span>{formatDate(right.createdAt)}</span>
                              <div className="flex items-center gap-3 flex-shrink-0">
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
                          </div>
                          {rightUrl && (
                            <ThumbBox>
                              <Thumb src={rightUrl} alt={right.title} />
                            </ThumbBox>
                          )}
                        </article>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 무한스크롤 센티넬 & 상태 표시 */}
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
