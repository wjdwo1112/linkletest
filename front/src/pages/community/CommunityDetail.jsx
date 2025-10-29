// src/pages/community/CommunityDetail.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  EyeIcon,
  PencilSquareIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import DOMPurify from 'dompurify';
import { postApi } from '../../services/api/postApi';
import { fileApi } from '../../services/api/fileApi';
import { clubApi } from '../../services/api/clubApi';
import useUserStore from '../../store/useUserStore';
import AlertModal from '../../components/common/AlertModal';

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

/* ── utils ───────────────────────────────────────────────────────── */
function parseFirstFileId(imagesString) {
  if (!imagesString) return null;
  const m = String(imagesString).match(/\d+/g);
  if (!m || !m.length) return null;
  const id = parseInt(m[0], 10);
  return Number.isInteger(id) ? id : null;
}

/** 미리보기 텍스트: DOMPurify로 XSS 제거 + 모든 태그 제거 */
function sanitizePreview(html) {
  if (!html) return '';
  // 모든 태그/속성 차단 → 순수 텍스트만 남김
  const cleaned = DOMPurify.sanitize(String(html), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  // DOMPurify 결과에 남을 수 있는 공백 정리
  return cleaned.replace(/\s+/g, ' ').trim();
}

/* ── small components ────────────────────────────────────────────── */
function Thumb({ src, alt }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt || ''}
      className="absolute inset-0 w-full h-full object-cover"
      onError={(e) => (e.currentTarget.style.display = 'none')}
      loading="lazy"
    />
  );
}

function ThumbBox({ src, alt, className = '' }) {
  // 오른쪽 칸 너비는 항상 유지 (이미지 없으면 투명 스페이서)
  return (
    <div
      className={`relative w-[120px] h-[84px] rounded-md overflow-hidden ${src ? 'border border-gray-200 bg-gray-100' : ''} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt || ''}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => (e.currentTarget.style.display = 'none')}
          loading="lazy"
        />
      ) : null}
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

/* ── main ────────────────────────────────────────────────────────── */
export default function CommunityDetail() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const decodedTab = useMemo(() => (tab ? decodeURIComponent(tab) : '전체'), [tab]);
  const { isAuthenticated: isLoggedIn } = useUserStore();

  // state
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [selectedClubIds, setSelectedClubIds] = useState([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [thumbnailMap, setThumbnailMap] = useState(new Map());
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isAppending, setIsAppending] = useState(false);
  const [noMore, setNoMore] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMemberOnlyModal, setShowMemberOnlyModal] = useState(false);
  const [selectedClubName, setSelectedClubName] = useState('');

  const handlePostClick = async (e, post) => {
    e.preventDefault();

    // 비로그인 사용자 체크
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    // SCOPE가 'MEMBER'인 경우 동호회 회원 체크
    if (post.scope === 'MEMBER') {
      const isMember = joinedClubs.some((club) => club.clubId === post.clubId);
      if (!isMember) {
        setSelectedClubName(post.clubName || '동호회');
        setShowMemberOnlyModal(true);
        return;
      }
    }

    // 정상적으로 상세 페이지로 이동
    navigate(`/community/posts/${post.postId}`);
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate('/login');
  };

  // load
  useEffect(() => {
    let cancelled = false;
    (async () => {
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
          const posts = (all.value || [])
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setAllPosts(posts);
        } else {
          throw all.reason;
        }

        if (clubs.status === 'fulfilled') setJoinedClubs(clubs.value || []);

        setSelectedCategory(CATEGORY_LIST.includes(decodedTab) ? decodedTab : '전체');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError('게시글을 불러올 수 없습니다.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [decodedTab, isLoggedIn]);

  // outside click close
  useEffect(() => {
    const handler = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target))
        setShowFilterDropdown(false);
    };
    if (showFilterDropdown) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [showFilterDropdown]);

  // filter
  const filteredPosts = useMemo(() => {
    let base = allPosts;
    if (selectedCategory !== '전체') {
      const db = CATEGORY_DB_MAP[selectedCategory];
      base = base.filter((p) => (p.parentCategoryName || p.categoryName) === db);
    }
    if (selectedClubIds.length > 0) {
      const set = new Set(selectedClubIds);
      base = base.filter((p) => set.has(p.clubId));
    }
    return base;
  }, [allPosts, selectedCategory, selectedClubIds]);

  // thumbs
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!filteredPosts.length) {
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
        if (r.status === 'fulfilled' && r.value?.link) map.set(r.value.postId, r.value.link);
      });
      setThumbnailMap(map);
    })();
    setVisibleCount(BATCH_SIZE);
    setNoMore(false);
    return () => {
      cancelled = true;
    };
  }, [filteredPosts]);

  // infinite
  useEffect(() => {
    if (!sentinelRef.current || noMore || loading) return;
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
        if (entries[0].isIntersecting) appendMore();
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

  const handleSelectCategory = (category) => navigate(`/community/${encodeURIComponent(category)}`);
  const handleFilterClick = (clubId) => {
    if (clubId === null) {
      setSelectedClubIds([]);
      setShowFilterDropdown(false);
      return;
    }
    setSelectedClubIds((prev) =>
      prev.includes(clubId) ? prev.filter((id) => id !== clubId) : [...prev, clubId],
    );
  };

  const getThumb = (id) => thumbnailMap.get(id) || null;
  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const rows = toRows(visiblePosts);

  if (loading)
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 text-center">
        <div className="text-gray-500">게시글을 불러오는 중...</div>
      </div>
    );
  if (error)
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

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      {/* 상단: 카테고리 탭 + 가입동호회 필터 */}
      <div className="mb-6 flex items-center justify-between gap-4">
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

        {isLoggedIn && joinedClubs.length > 0 && (
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setShowFilterDropdown((v) => !v)}
              className="bg-white border border-gray-600 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2"
              aria-haspopup="menu"
              aria-expanded={showFilterDropdown}
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
                const leftUrl = left ? getThumb(left.postId) : null;
                const rightUrl = right ? getThumb(right.postId) : null;

                const Footer = ({ post }) => (
                  <div className="col-span-2 mt-2 flex items-center justify-between text-sm">
                    {/* 왼쪽: 동호회명 · 작성자 */}
                    <div className="text-gray-500 truncate">
                      {post.clubName || '동호회명'} ·{' '}
                      {post.authorNickname || post.authorName || post.creatorName || '작성자'}
                    </div>
                    {/* 오른쪽: 메타 */}
                    <div className="flex items-center gap-4 text-gray-500 pr-1">
                      <span className="flex items-center gap-1">
                        <EyeIcon className="w-[18px] h-[18px] shrink-0" />
                        <span className="text-[15px] leading-none font-medium">
                          {post.viewCount ?? 0}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <HeartIcon className="w-[18px] h-[18px] shrink-0" />
                        <span className="text-[15px] leading-none font-medium">
                          {post.likeCount ?? 0}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <ChatBubbleOvalLeftIcon className="w-[18px] h-[18px] shrink-0" />
                        <span className="text-[15px] leading-none font-medium">
                          {post.commentCount ?? 0}
                        </span>
                      </span>
                    </div>
                  </div>
                );

                const Card = ({ post, url }) => {
                  const previewHtml = sanitizePreview(post.content); // DOMPurify + preview
                  const hasImg = !!url;

                  return (
                    <article className="grid grid-cols-[1fr_auto] gap-4">
                      {/* LEFT: 텍스트 영역 */}
                      <div className="flex flex-col h-[150px] min-h-[150px]">
                        <div className="text-xs text-gray-500 mb-1">
                          {post.parentCategoryName || post.categoryName || '카테고리'}
                        </div>

                        <h3 className="text-base font-semibold text-gray-900 mb-4 break-words line-clamp-1">
                          <a
                            href={`/community/posts/${post.postId}`}
                            onClick={(e) => handlePostClick(e, post)}
                            className="hover:underline cursor-pointer"
                          >
                            {post.title || '제목 없음'}
                          </a>
                        </h3>

                        <div
                          className="text-sm text-gray-600 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: previewHtml }}
                        />

                        {/* 푸터 */}
                        <div className="mt-auto pt-1 flex items-center justify-between text-[13px]">
                          <div className="text-gray-500 truncate">
                            {post.clubName || '동호회명'} ·{' '}
                            {post.authorNickname || post.authorName || post.creatorName || '작성자'}
                          </div>
                        </div>
                      </div>

                      {/* RIGHT: 이미지 + 메타 */}
                      <div className="flex flex-col justify-end items-end h-[150px]">
                        {/* 이미지 (하단 배치) */}
                        {hasImg && (
                          <a
                            href={`/community/posts/${post.postId}`}
                            onClick={(e) => handlePostClick(e, post)}
                            className="block mb-2 cursor-pointer"
                          >
                            <div className="relative w-[132px] h-[96px] rounded-md overflow-hidden border border-gray-200 bg-gray-100">
                              <img
                                src={url}
                                alt={post.title}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                loading="lazy"
                              />
                            </div>
                          </a>
                        )}

                        {/* 메타 아이콘 한 줄 정렬 */}
                        <div className="flex items-center gap-3 text-gray-500 pr-1">
                          <span className="flex items-center gap-1">
                            <EyeIcon className="w-4 h-4" /> {post.viewCount ?? 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <HeartIcon className="w-4 h-4" /> {post.likeCount ?? 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <ChatBubbleOvalLeftIcon className="w-4 h-4" /> {post.commentCount ?? 0}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                };

                return (
                  <div
                    key={idx}
                    className={`grid grid-cols-2 gap-x-0 py-8 ${
                      idx !== rows.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    <div className="pr-8">{left && <Card post={left} url={leftUrl} />}</div>
                    <div className="pl-8">{right && <Card post={right} url={rightUrl} />}</div>
                  </div>
                );
              })}
            </div>
          </div>

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

      {isLoggedIn && <WriteFab />}

      <AlertModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="알림"
        message="로그인 후 이용 가능합니다."
        confirmText="로그인"
        onConfirm={handleLoginRedirect}
      />

      <AlertModal
        isOpen={showMemberOnlyModal}
        onClose={() => setShowMemberOnlyModal(false)}
        title="알림"
        message={`동호회 회원만 볼 수 있습니다.`}
        confirmText="확인"
      />
    </div>
  );
}
