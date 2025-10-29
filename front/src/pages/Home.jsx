import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clubApi } from '../services/api/clubApi';
import { categoryApi } from '../services/api/categoryApi';

const Home = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categories, setCategories] = useState([]);
  const [recentClubs, setRecentClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, recentClubsData] = await Promise.all([
        categoryApi.getCategoriesHierarchy(),
        clubApi.getRecentClubs(),
      ]);

      const parentCategories = categoriesData.filter((cat) => !cat.parentCategoryId);
      setCategories(parentCategories);
      setRecentClubs(recentClubsData);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/clubs/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/clubs/category/${categoryId}`);
  };

  const handleClubClick = (clubId) => {
    navigate(`/clubs/${clubId}/detail`);
  };

  const handleMoreClick = () => {
    navigate('/clubs/recent');
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

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
            {categories.map((category) => (
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

        <div className="mb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">최근 생성된 동호회</h2>
            <button
              onClick={handleMoreClick}
              className="text-gray-500 hover:text-primary transition-colors"
            >
              더보기 &gt;
            </button>
          </div>

          {recentClubs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">생성된 동호회가 없습니다.</div>
          ) : (
            <div className="grid grid-cols-3 gap-8">
              {recentClubs.map((club) => (
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
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500">이미지</span>
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
              ))}
            </div>
          )}
        </div>

        <div className="fixed bottom-8 right-8">
          <button className="w-14 h-14 bg-primary rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center text-white text-2xl">
            💬
          </button>
        </div>
      </div>
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
