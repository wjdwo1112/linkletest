import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { clubApi } from '../../services/api/clubApi';

const ClubSearch = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get('keyword') || '';

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(keyword);

  useEffect(() => {
    if (keyword) {
      fetchClubs();
    }
  }, [keyword]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const data = await clubApi.searchClubs(keyword);
      setClubs(data || []);
    } catch (error) {
      console.error('검색 실패:', error);
      setClubs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      navigate(`/clubs/search?keyword=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClubClick = (clubId) => {
    navigate(`/clubs/${clubId}/detail`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 검색 바 */}
      <div className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative">
            <input
              type="text"
              placeholder="동호회"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-8 py-4 text-lg border-2 border-blue-400 rounded-full focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSearch}
              className="absolute right-6 top-1/2 transform -translate-y-1/2"
            >
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20 text-gray-500">검색 중...</div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-20 text-gray-500">검색 결과가 없습니다.</div>
        ) : (
          <>
            {/* 검색 결과 헤더 */}
            <div className="flex items-center gap-3 mb-8">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h2 className="text-xl font-bold">&quot;{keyword}&quot; 검색 결과</h2>
            </div>

            {/* 검색 결과 리스트 */}
            <div className="space-y-6">
              {clubs.map((club) => (
                <div
                  key={club.clubId}
                  onClick={() => handleClubClick(club.clubId)}
                  className="bg-white rounded-lg p-6 cursor-pointer hover:shadow-md transition flex gap-6"
                >
                  {/* 동호회 이미지 */}
                  <div className="w-48 h-32 bg-gray-300 rounded flex-shrink-0">
                    {club.fileLink ? (
                      <img
                        src={club.fileLink}
                        alt={club.clubName}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        이미지 없음
                      </div>
                    )}
                  </div>

                  {/* 동호회 정보 */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">{club.clubName}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {club.description || '동호회소개 동호회소개 동호회소개'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{club.categoryName}</span>
                      <span>•</span>
                      <span>{club.region}</span>
                      <span>•</span>
                      <span>멤버 {club.maxMembers}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClubSearch;
