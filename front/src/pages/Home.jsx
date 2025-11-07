import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clubApi } from '../services/api/clubApi';
import { categoryApi } from '../services/api/categoryApi';
import Chatbot from '../components/chatbot/Chatbot';
import useUserStore from '../store/useUserStore';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categories, setCategories] = useState([]);
  const [recentClubs, setRecentClubs] = useState([]);
  const [popularClubs, setPopularClubs] = useState([]);
  const [growingClubs, setGrowingClubs] = useState([]);
  const [activeClubs, setActiveClubs] = useState([]);
  const [categoryRecommendClubs, setCategoryRecommendClubs] = useState([]);
  const [regionRecommendClubs, setRegionRecommendClubs] = useState([]);

  const [loadingStates, setLoadingStates] = useState({
    categories: true,
    recent: true,
    growing: true,
    popular: true,
    active: true,
    recommend: true,
  });

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    // try {
    //   const [categoriesData, recentClubsData] = await Promise.all([
    //     categoryApi.getCategoriesHierarchy(),
    //     clubApi.getRecentClubs(),
    //   ]);

    //   const parentCategories = categoriesData.filter((cat) => !cat.parentCategoryId);
    //   setCategories(parentCategories);
    //   setRecentClubs(recentClubsData);
    // } catch (error) {
    //   console.error('데이터 로딩 실패:', error);
    // }

    Promise.all([categoryApi.getCategoriesHierarchy(), clubApi.getRecentClubs()]).then(
      ([categoriesData, recentClubsData]) => {
        const parentCategories = categoriesData.filter((cat) => !cat.parentCategoryId);
        setCategories(parentCategories);
        setRecentClubs(recentClubsData);
        setLoadingStates((prev) => ({ ...prev, categories: false, recent: false }));
      },
    );

    clubApi.getGrowingClubs(3).then((data) => {
      setGrowingClubs(data);
      setLoadingStates((prev) => ({ ...prev, growing: false }));
    });

    clubApi.getPopularClubs(3).then((data) => {
      setPopularClubs(data);
      setLoadingStates((prev) => ({ ...prev, popular: false }));
    });

    clubApi.getActiveClubs(3).then((data) => {
      setActiveClubs(data);
      setLoadingStates((prev) => ({ ...prev, active: false }));
    });

    if (isAuthenticated) {
      Promise.all([clubApi.getRecommendByCategory(), clubApi.getRecommendByRegion()])
        .then(([categoryData, regionData]) => {
          setCategoryRecommendClubs(Array.isArray(categoryData) ? categoryData.slice(0, 3) : []);
          setRegionRecommendClubs(Array.isArray(regionData) ? regionData.slice(0, 3) : []);
        })
        .catch(() => {})
        .finally(() => {
          setLoadingStates((prev) => ({ ...prev, recommend: false }));
        });
    } else {
      setLoadingStates((prev) => ({ ...prev, recommend: false }));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/clubs/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/clubs/list?type=category&categoryId=${categoryId}`);
  };

  const handleClubClick = (clubId) => {
    navigate(`/clubs/${clubId}/detail`);
  };

  const handleMoreClick = (type) => {
    navigate(`/clubs/list?type=${type}`);
  };

  const renderClubCard = (club) => (
    <div
      key={club.clubId}
      onClick={() => handleClubClick(club.clubId)}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
        {club.fileLink ? (
          <img
            src={club.fileLink}
            alt={club.clubName}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300"></div>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-bold text-xl mb-3 text-gray-900">{club.clubName}</h3>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
          {club.description || '동호회 소개가 없습니다.'}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{club.categoryName}</span>
          <span>멤버 {club.memberCount}명</span>
        </div>
      </div>
    </div>
  );

  const renderSkeletonCard = () => (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded mb-3"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );

  const renderClubSection = (title, clubs, type, isLoading) => (
    <div className="mb-20">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {clubs.length > 0 && (
          <button
            onClick={() => handleMoreClick(type)}
            className="text-gray-500 hover:text-primary transition-colors"
          >
            더보기 &gt;
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i}>{renderSkeletonCard()}</div>
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">동호회가 없습니다.</div>
      ) : (
        <div className="grid grid-cols-3 gap-8">{clubs.map(renderClubCard)}</div>
      )}
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <form onSubmit={handleSearch} className="mb-16 flex justify-center">
          <div className="relative w-full max-w-4xl">
            <input
              type="text"
              placeholder="검색어를 입력해 주세요"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full px-6 py-5 text-lg border-2 border-primary rounded-full focus:outline-none bg-white shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-primary text-xl"
            >
              🔍
            </button>
          </div>
        </form>

        <div className="mb-20 flex justify-center">
          <div className="flex space-x-10">
            {loadingStates.categories
              ? [1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mb-3"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))
              : categories.map((category) => (
                  <div
                    key={category.categoryId}
                    onClick={() => handleCategoryClick(category.categoryId)}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow">
                      <span className="text-2xl">{getCategoryIcon(category.name)}</span>
                    </div>
                    <span className="text-sm text-gray-700 text-center whitespace-nowrap group-hover:text-gray-900">
                      {category.name}
                    </span>
                  </div>
                ))}
          </div>
        </div>

        {renderClubSection('최근 생성된 동호회', recentClubs, 'recent', loadingStates.recent)}
        {renderClubSection('급성장 동호회', growingClubs, 'growing', loadingStates.growing)}
        {renderClubSection('인기 동호회', popularClubs, 'popular', loadingStates.popular)}
        {renderClubSection('활발한 동호회', activeClubs, 'active', loadingStates.active)}

        {isAuthenticated && (
          <>
            {renderClubSection(
              '취향 저격 동호회',
              categoryRecommendClubs,
              'recommend-category',
              loadingStates.recommend,
            )}
            {renderClubSection(
              '동네 픽 추천',
              regionRecommendClubs,
              'recommend-region',
              loadingStates.recommend,
            )}
          </>
        )}
      </div>
      <Chatbot />
    </div>
  );
};

const getCategoryIcon = (name) => {
  const iconMap = {
    '운동·스포츠': '⚽',
    '문화·예술': '🎨',
    취미: '💛',
    자기계발: '📚',
    '푸드·드링크': '🍺',
    '여행·아웃도어': '✈️',
    '게임·오락': '🎮',
    외국어: '🌐',
  };
  return iconMap[name] || '📌';
};

export default Home;
