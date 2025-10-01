import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  EyeIcon,
  PhotoIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

/** 공용 목업 (Community.jsx와 동일) */
const DEFAULT_THUMB = 'https://picsum.photos/160/110?grayscale';
const MOCK_POSTS = [
  {
    id: 1,
    category: '외국어',
    title: '영어 스피킹 스터디 신규 모집',
    content: '주 2회 저녁 8시에 온라인으로 진행합니다. 관심 있으신 분들 연락주세요!',
    image: DEFAULT_THUMB,
    author: '링클 잉글리시',
    authorType: '운영진',
    time: '5분 전',
    views: 120,
    likes: 12,
    comments: 4,
    createdAt: '2025-09-10T11:45:00Z',
  },
  {
    id: 2,
    category: '운동/스포츠',
    title: '한강 러닝 모임 코스 공유',
    content: '용산→여의도 8km, 뷰가 좋아요. 수/금 저녁에 같이 뛰어요!',
    image: DEFAULT_THUMB,
    author: '러닝크루',
    authorType: '매니저',
    time: '10분 전',
    views: 77,
    likes: 9,
    comments: 3,
    createdAt: '2025-09-10T11:40:00Z',
  },
  {
    id: 3,
    category: '문화/예술',
    title: '전시회 같이 가실 분',
    content: '주말 오후에 서촌 신작전시 보러 가요. 3~4명 소규모로!',
    image: '',
    author: '아트워크',
    authorType: '회원',
    time: '1시간 전',
    views: 64,
    likes: 6,
    comments: 1,
    createdAt: '2025-09-10T10:50:00Z',
  },
  {
    id: 4,
    category: '자기계발',
    title: '독서 모임 이번 달 북 리스트',
    content: '이번 달은 생산성/심리 분야 도서 위주로 3권 정했습니다.',
    image: '',
    author: '잘읽는사람들',
    authorType: '운영진',
    time: '2시간 전',
    views: 51,
    likes: 4,
    comments: 0,
    createdAt: '2025-09-10T10:30:00Z',
  },
  {
    id: 5,
    category: '푸드 드링크',
    title: '성수 신상 카페 리뷰',
    content: '디저트가 특히 괜찮네요. 다음 번엔 다같이 가보실?',
    image: DEFAULT_THUMB,
    author: '맛있는모임',
    authorType: '회원',
    time: '어제',
    views: 203,
    likes: 25,
    comments: 6,
    createdAt: '2025-09-10T09:10:00Z',
  },
];

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
  const [posts, setPosts] = useState(MOCK_POSTS);

  useEffect(() => {
    if (CATEGORY_LIST.includes(decodedTab)) {
      setSelectedCategory(decodedTab);
      setPosts(
        decodedTab === '전체'
          ? [...MOCK_POSTS].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [...MOCK_POSTS]
              .filter((p) => p.category === decodedTab)
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      );
    } else {
      setSelectedCategory('전체');
      setPosts(MOCK_POSTS);
    }
  }, [decodedTab]);

  const handleSelectCategory = (category) => {
    navigate(`/community/${encodeURIComponent(category)}`);
  };

  const rows = toRows(posts);

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      {/* 카테고리 탭 */}
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

      {/* 리스트 (행 단위) */}
      <div className="relative">
        {/* 가운데 세로 라인 */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 pointer-events-none" />

        <div>
          {rows.map(([left, right], idx) => (
            <div key={idx} className="grid grid-cols-2 gap-x-0 py-8 border-b border-gray-200">
              {/* LEFT */}
              <div className="pr-8">
                {left && (
                  <article className="grid grid-cols-[1fr_auto] gap-6">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">{left.category}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <Link to={`/community/posts/${left.id}`} className="hover:underline">
                          {left.title}
                        </Link>
                      </h3>
                      {left.content && (
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">{left.content}</p>
                      )}
                      <div className="text-sm text-gray-500 flex items-center gap-4">
                        <span className="font-medium text-gray-800">{left.author}</span>
                        <span>{left.authorType}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                        <span>{left.time}</span>
                        <span className="inline-flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" /> {left.views}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <HeartIcon className="w-4 h-4" /> {left.likes}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ChatBubbleOvalLeftIcon className="w-4 h-4" /> {left.comments}
                        </span>
                      </div>
                    </div>
                    <Thumb src={left.image} alt={left.title} />
                  </article>
                )}
              </div>

              {/* RIGHT */}
              <div className="pl-8">
                {right && (
                  <article className="grid grid-cols-[1fr_auto] gap-6">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">{right.category}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <Link to={`/community/posts/${right.id}`} className="hover:underline">
                          {right.title}
                        </Link>
                      </h3>
                      {right.content && (
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                          {right.content}
                        </p>
                      )}
                      <div className="text-sm text-gray-500 flex items-center gap-4">
                        <span className="font-medium text-gray-800">{right.author}</span>
                        <span>{right.authorType}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                        <span>{right.time}</span>
                        <span className="inline-flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" /> {right.views}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <HeartIcon className="w-4 h-4" /> {right.likes}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ChatBubbleOvalLeftIcon className="w-4 h-4" /> {right.comments}
                        </span>
                      </div>
                    </div>
                    <Thumb src={right.image} alt={right.title} />
                  </article>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 더보기 버튼 */}
      <div className="mt-12 text-center">
        <button
          className="px-6 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
          onClick={() => console.log('더보기 클릭')}
        >
          더보기
        </button>
      </div>
      <WriteFab />
    </div>
  );
}
