import { useState, useEffect } from 'react';
import { clubApi } from '../../services/api/clubApi';
import { categoryApi } from '../../services/api/categoryApi';
import ClubCard from './ClubCard';

const ClubListPage = () => {
  const [clubs, setClubs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchClubs();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getChildCategories();
      setCategories([{ categoryId: 0, name: '전체' }, ...data]);
    } catch (error) {
      console.error('카테고리를 불러오는데 실패했습니다:', error);
    }
  };

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const data = await clubApi.getJoinedClubs();
      setClubs(data);
    } catch (error) {
      console.error('동호회 목록을 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: 검색 API 연동
    console.log('검색어:', searchKeyword);
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  const filteredClubs =
    selectedCategory === '전체'
      ? clubs
      : clubs.filter((club) => club.categoryName === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 검색 바 */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex justify-center">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="검색어를 입력해 주세요"
              className="w-full px-6 py-4 pr-12 rounded-full border border-gray-300 focus:outline-none focus:border-blue-400"
            />
            <button type="submit" className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-8">
        <div className="flex gap-4 justify-center flex-wrap">
          {categories.map((category) => (
            <button
              key={category.categoryId}
              onClick={() => handleCategoryClick(category.name)}
              className={`px-6 py-2 rounded-full transition ${
                selectedCategory === category.name
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={selectedCategory === category.name ? { backgroundColor: '#4CA8FF' } : {}}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 동호회 섹션 */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">최근 생성된 동호회</h2>
          <button className="text-gray-500 text-sm">더보기 &gt;</button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-500">로딩 중...</div>
        ) : filteredClubs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">가입한 동호회가 없습니다</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.slice(0, 3).map((club) => (
              <ClubCard key={club.clubId} club={club} />
            ))}
          </div>
        )}
      </div>

      {/* 활동 활발한 동호회 */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">활동 활발한 동호회</h2>
          <button className="text-gray-500 text-sm">더보기 &gt;</button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-500">로딩 중...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.slice(3, 6).map((club) => (
              <ClubCard key={club.clubId} club={club} />
            ))}
          </div>
        )}
      </div>

      {/* 추천 동호회 */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">추천 동호회</h2>
          <button className="text-gray-500 text-sm">더보기 &gt;</button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-500">로딩 중...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.slice(6, 9).map((club) => (
              <ClubCard key={club.clubId} club={club} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubListPage;
