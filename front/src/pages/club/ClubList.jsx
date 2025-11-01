import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { clubApi, categoryApi } from '../../services/api';

const ClubList = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const type = searchParams.get('type');
  const categoryId = searchParams.get('categoryId');

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [pageTitle, setPageTitle] = useState('');

  const observerRef = useRef();
  const lastClubRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreClubs();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore],
  );

  useEffect(() => {
    setClubs([]);
    setCursor(null);
    setHasMore(true);
    fetchInitialData();
  }, [type, categoryId]);

  const fetchInitialData = async () => {
    try {
      if (type === 'category' && categoryId) {
        const categories = await categoryApi.getCategoriesHierarchy();
        const category = categories
          .flatMap((parent) => [parent, ...(parent.children || [])])
          .find((cat) => cat.categoryId === parseInt(categoryId));

        if (category) {
          setPageTitle(category.name);
        }
      } else if (type === 'recent') {
        setPageTitle('최근 생성 동호회');
      }

      loadMoreClubs(true);
    } catch (error) {
      console.error('초기 데이터 로드 실패:', error);
    }
  };

  const loadMoreClubs = async (isInitial = false) => {
    if (loading) return;

    setLoading(true);

    try {
      let response;

      if (type === 'recent') {
        response = await clubApi.getRecentClubsAll(12, isInitial ? null : cursor);
      } else if (type === 'category' && categoryId) {
        response = await clubApi.getClubsByCategoryAll(
          parseInt(categoryId),
          12,
          isInitial ? null : cursor,
        );
      }

      if (response && response.length > 0) {
        setClubs((prev) => (isInitial ? response : [...prev, ...response]));
        setCursor(response[response.length - 1].clubId);

        if (response.length < 12) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('동호회 목록 로드 실패:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClubClick = (clubId) => {
    navigate(`/clubs/${clubId}/detail`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{pageTitle}</h1>

      {clubs.length === 0 && !loading ? (
        <div className="text-center py-12 text-gray-500">동호회가 없습니다.</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-8">
            {clubs.map((club, index) => {
              const isLastClub = index === clubs.length - 1;

              return (
                <div
                  key={club.clubId}
                  ref={isLastClub ? lastClubRef : null}
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
              );
            })}
          </div>

          {loading && <div className="text-center py-8 text-gray-500">로딩 중...</div>}
        </>
      )}
    </div>
  );
};

export default ClubList;
