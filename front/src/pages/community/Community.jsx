import React, { useMemo } from "react";
import { Heart, ChatIcon } from "@components/ui/icons";
import { EyeIcon,PencilSquareIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

/** 공용 목업 (세 파일 동일) */
const DEFAULT_THUMB = "https://picsum.photos/160/110?grayscale";
const MOCK_POSTS = [
  {
    id: 1,
    category: "외국어",
    title: "영어 스피킹 스터디 신규 모집",
    content:
      "주 2회 저녁 8시에 온라인으로 진행합니다. 관심 있으신 분들 연락주세요!",
    image: DEFAULT_THUMB,
    club: "링클 잉글리시",
    author: "링클 잉글리시",
    authorType: "운영진",
    time: "5분 전",
    views: 120,
    likes: 12,
    comments: 4,
    createdAt: "2025-09-10T11:45:00Z",
  },
  {
    id: 2,
    category: "운동/스포츠",
    title: "한강 러닝 모임 코스 공유",
    content: "용산→여의도 8km, 뷰가 좋아요. 수/금 저녁에 같이 뛰어요!",
    image: DEFAULT_THUMB,
    club: "러닝크루",
    author: "러닝크루",
    authorType: "매니저",
    time: "10분 전",
    views: 77,
    likes: 9,
    comments: 3,
    createdAt: "2025-09-10T11:40:00Z",
  },
  {
    id: 3,
    category: "문화/예술",
    title: "전시회 같이 가실 분",
    content: "주말 오후에 서촌 신작전시 보러 가요. 3~4명 소규모로!",
    image: "",
    club: "아트워크",
    author: "아트워크",
    authorType: "회원",
    time: "1시간 전",
    views: 64,
    likes: 6,
    comments: 1,
    createdAt: "2025-09-10T10:50:00Z",
  },
  {
    id: 4,
    category: "자기계발",
    title: "독서 모임 이번 달 북 리스트",
    content: "이번 달은 생산성/심리 분야 도서 위주로 3권 정했습니다.",
    image: "",
    club: "잘읽는사람들",
    author: "잘읽는사람들",
    authorType: "운영진",
    time: "2시간 전",
    views: 51,
    likes: 4,
    comments: 0,
    createdAt: "2025-09-10T10:30:00Z",
  },
  {
    id: 5,
    category: "푸드 드링크",
    title: "성수 신상 카페 리뷰",
    content: "디저트가 특히 괜찮네요. 다음 번엔 다같이 가보실?",
    image: DEFAULT_THUMB,
    club: "맛있는모임",
    author: "맛있는모임",
    authorType: "회원",
    time: "어제",
    views: 203,
    likes: 25,
    comments: 6,
    createdAt: "2025-09-10T09:10:00Z",
  },
];

const CATEGORY_META = [
  { icon: "⚽", title: "운동/스포츠" },
  { icon: "🎨", title: "문화/예술" },
  { icon: "🎮", title: "취미" },
  { icon: "📚", title: "자기계발" },
  { icon: "🍴", title: "푸드 드링크" },
  { icon: "✈️", title: "여행/아웃도어" },
  { icon: "🕹️", title: "게임/오락" },
  { icon: "🌍", title: "외국어" },
];

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

const Community = () => {
  const latestAll = useMemo(
    () =>
      [...MOCK_POSTS].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    []
  );

  // 카테고리별 최신 3개
  const buckets = useMemo(() => {
    const map = {};
    CATEGORY_META.forEach((c) => {
      map[c.title] = latestAll
        .filter((p) => p.category === c.title)
        .slice(0, 3);
    });
    return map;
  }, [latestAll]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* 전체 동호회 글 */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">전체 동호회 글</h2>
          <Link
            to={`/community/${encodeURIComponent("전체")}`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            더보기 &gt;
          </Link>
        </div>

        <ul>
          {latestAll.slice(0, 5).map((post, index) => (
            <li key={post.id}>
              <Link
                to={`/community/posts/${post.id}`}
                className={`flex items-center justify-between py-2 px-1 hover:bg-gray-50 transition ${
                  index !== 4 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span className="text-gray-800 text-sm">
                    <span className="font-semibold">{post.club}</span> ·{" "}
                    {post.title}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ChatIcon className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="h-px bg-gray-200 my-8" />

      {/* 카테고리 그리드 (항상 2열, 반응형 X) */}
      <div className="grid grid-cols-2 gap-8">
        {CATEGORY_META.map((cat) => {
          const items = buckets[cat.title] || [];
          return (
            <div key={cat.title}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{cat.icon}</span>
                  <h3 className="text-base font-bold text-gray-800">
                    {cat.title}
                  </h3>
                </div>
                <Link
                  to={`/community/${encodeURIComponent(cat.title)}`}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  더보기 &gt;
                </Link>
              </div>

              {items.length > 0 ? (
                <ul className="space-y-1">
                  {items.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between text-sm py-1 px-1 hover:bg-gray-50 rounded"
                    >
                      <Link
                        to={`/community/posts/${p.id}`}
                        className="truncate flex-1 text-gray-600 hover:underline"
                      >
                        {p.title}
                      </Link>
                      <div className="flex items-center space-x-2 text-xs text-gray-400 ml-3">
                        <span>{p.time}</span>
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="w-3 h-3" />
                          <span>{p.views}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-400 py-4 text-center">
                  게시글이 없습니다
                </div>
              )}
            </div>
          );
        })}
      </div>
      <WriteFab />
    </div>
  );
};

export default Community;
