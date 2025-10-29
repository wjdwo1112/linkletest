// front/src/pages/community/Community.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import {
  HeartIcon as Heart,
  ChatBubbleOvalLeftIcon as ChatIcon,
} from '@heroicons/react/24/outline';
import { postApi } from '../../services/api/postApi';
import useUserStore from '../../store/useUserStore';
import { clubApi } from '../../services/api/clubApi';
import AlertModal from '../../components/common/AlertModal';
import { useAlert } from '../../hooks/useAlert';

const CATEGORY_META = [
  { icon: '⚽', title: '운동/스포츠', dbName: '운동·스포츠' },
  { icon: '🎨', title: '문화/예술', dbName: '문화·예술' },
  { icon: '🎮', title: '취미', dbName: '취미' },
  { icon: '📚', title: '자기계발', dbName: '자기계발' },
  { icon: '🍴', title: '푸드/드링크', dbName: '푸드·드링크' },
  { icon: '✈️', title: '여행/아웃도어', dbName: '여행·아웃도어' },
  { icon: '🕹️', title: '게임/오락', dbName: '게임·오락' },
  { icon: '🌍', title: '외국어', dbName: '외국어' },
];

const matchCategory = (post, dbName) => {
  // parentCategoryName이 있으면 상위 카테고리로 비교, 없으면 categoryName으로 비교
  const targetCategory = post.parentCategoryName || post.categoryName;
  return targetCategory === dbName;
};

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
  const navigate = useNavigate();
  const { isAuthenticated: isLoggedIn } = useUserStore();
  const { alertState, showAlert, closeAlert } = useAlert();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinedClubs, setJoinedClubs] = useState([]);

  const isMemberOf = (clubId) =>
    joinedClubs.some((c) => Number(c.clubId) === Number(clubId) && c.status === 'APPROVED');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await postApi.getPostList();
        console.log('전체 게시글:', data);
        setPosts(data);

        // 로그인한 경우 가입한 동호회 목록 조회
        if (isLoggedIn) {
          try {
            const clubsData = await clubApi.getJoinedClubs();
            setJoinedClubs(clubsData || []);
          } catch (clubError) {
            console.log('동호회 목록 조회 불가:', clubError);
            setJoinedClubs([]);
          }
        }
      } catch (err) {
        console.error('게시글 목록 조회 실패:', err);
        setError('게시글을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [isLoggedIn]); // 의존성 배열에 isLoggedIn 추가

  const handlePostClick = (e, post) => {
    e.preventDefault(); // Link 기본 동작 방지

    // 로그인 안했으면 모든 게시글 차단
    if (!isLoggedIn) {
      showAlert('로그인 후 이용 가능합니다.');
      return;
    }
    // MEMBER 공개범위면 회원 여부
    if (post.scope === 'MEMBER' && !isMemberOf(post.clubId)) {
      showAlert('동호회 회원만 볼 수 있습니다.');
      return;
    }
    navigate(`/community/posts/${post.postId}`, {
      state: { scope: post.scope, clubId: post.clubId },
    });
  };

  const latestAll = useMemo(
    () => [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [posts],
  );

  const buckets = useMemo(() => {
    const map = {};
    CATEGORY_META.forEach((c) => {
      const filtered = latestAll.filter((p) => matchCategory(p, c.dbName));
      console.log(`${c.title} (DB: ${c.dbName}) 카테고리 게시글:`, filtered);
      map[c.title] = filtered.slice(0, 5);
    });
    return map;
  }, [latestAll]);

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
    <div className="max-w-5xl mx-auto px-6 py-8">
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        confirmText={alertState.confirmText}
      />
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">전체 동호회 글</h2>
          <Link
            to={`/community/${encodeURIComponent('전체')}`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            더보기 &gt;
          </Link>
        </div>

        <ul>
          {latestAll.slice(0, 5).map((post, index) => (
            <li key={post.postId}>
              <Link
                to={`/community/posts/${post.postId}`}
                onClick={(e) => handlePostClick(e, post)}
                className={`flex items-center justify-between py-2 px-1 hover:bg-gray-50 transition ${
                  index !== 4 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span className="text-gray-800 text-sm">
                    <span className="font-semibold">{post.clubName}</span> · {post.title}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{post.likeCount || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ChatIcon className="w-4 h-4" />
                    <span>{post.commentCount || 0}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="h-px bg-gray-200 my-8" />

      <div className="grid grid-cols-2 gap-8">
        {CATEGORY_META.map((cat) => {
          const items = buckets[cat.title] || [];
          return (
            <div key={cat.title}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{cat.icon}</span>
                  <h3 className="text-base font-bold text-gray-800">{cat.title}</h3>
                </div>
                <Link
                  to={`/community/${encodeURIComponent(cat.title)}`}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  더보기 &gt;
                </Link>
              </div>

              {items.length > 0 ? (
                <ul className="space-y-2">
                  {items.map((post) => (
                    <li key={post.postId}>
                      <Link
                        to={`/community/posts/${post.postId}`}
                        onClick={(e) => handlePostClick(e, post)}
                        className="flex items-center justify-between py-1 px-1 hover:bg-gray-50 transition"
                      >
                        <span className="text-sm text-gray-700 hover:text-gray-900 flex-1">
                          {post.title}
                        </span>
                        <div className="flex items-center space-x-1 text-xs text-gray-400 ml-2">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          <span>{post.viewCount || 0}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">게시글이 없습니다</p>
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
