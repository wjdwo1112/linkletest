import { useState, useEffect, useRef } from 'react';
import { galleryApi } from '../../services/api/galleryApi';
import { clubApi } from '../../services/api/clubApi';
import useUserStore from '../../store/useUserStore';
import GalleryDetailModal from './GalleryDetailModal';
import GalleryUploadModal from './GalleryUploadModal';

const BATCH_SIZE = 9; // 한 번에 로드할 갤러리 개수 (3의 배수)

export default function Gallery() {
  const { user, isAuthenticated: isLoggedIn } = useUserStore();

  const [galleries, setGalleries] = useState([]);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedGallery, setSelectedGallery] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // 무한스크롤용 상태
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isAppending, setIsAppending] = useState(false);
  const [noMore, setNoMore] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchGalleries();
    // 필터 변경시 무한스크롤 상태 리셋
    setVisibleCount(BATCH_SIZE);
    setNoMore(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [selectedClubId]);

  // 무한스크롤 Intersection Observer 설정
  useEffect(() => {
    if (loading || isAppending || noMore) return;
    if (visibleCount >= galleries.length) {
      setNoMore(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isAppending) {
          setIsAppending(true);
          setTimeout(() => {
            setVisibleCount((prev) => {
              const next = prev + BATCH_SIZE;
              if (next >= galleries.length) {
                setNoMore(true);
              }
              return next;
            });
            setIsAppending(false);
          }, 500);
        }
      },
      { threshold: 0.1, rootMargin: '100px' },
    );

    observerRef.current = observer;
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [galleries.length, visibleCount, loading, isAppending, noMore]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const galleriesData = await galleryApi.getGalleryList();
      setGalleries(galleriesData || []);

      if (isLoggedIn) {
        try {
          const clubsData = await clubApi.getJoinedClubs();
          setJoinedClubs(clubsData || []);
        } catch (clubError) {
          console.log('동호회 목록 조회 불가:', clubError);
          setJoinedClubs([]);
        }
      }
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleries = async () => {
    try {
      const galleriesData = await galleryApi.getGalleryList(selectedClubId);
      setGalleries(galleriesData || []);
    } catch (error) {
      console.error('갤러리 조회 실패:', error);
      setGalleries([]);
    }
  };

  const handleImageClick = (gallery) => {
    setSelectedGallery(gallery);
    setIsDetailOpen(true);
  };

  const handleUploadSuccess = () => {
    fetchGalleries();
    setIsUploadOpen(false);
  };

  const handleDeleteSuccess = () => {
    fetchGalleries();
    setIsDetailOpen(false);
  };

  const handleFilterClick = (clubId) => {
    setSelectedClubId(clubId);
    setShowFilterDropdown(false);
  };

  // 현재 화면에 보여줄 갤러리 목록
  const visibleGalleries = galleries.slice(0, visibleCount);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">갤러리</h1>
        <div className="flex items-center gap-3">
          {isLoggedIn && joinedClubs.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                필터
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleFilterClick(null)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                      selectedClubId === null
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
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                        selectedClubId === club.clubId
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {club.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {isLoggedIn && joinedClubs.length > 0 && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600"
            >
              등록
            </button>
          )}
        </div>
      </div>

      {/* 갤러리 그리드 - 3열 */}
      <div className="grid grid-cols-3 gap-4">
        {visibleGalleries.length === 0 ? (
          <div className="col-span-3 text-center py-20 text-gray-500">
            등록된 갤러리가 없습니다.
          </div>
        ) : (
          visibleGalleries.map((gallery) => (
            <div
              key={gallery.galleryId}
              onClick={() => handleImageClick(gallery)}
              className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            >
              {gallery.fileLink ? (
                <img
                  src={gallery.fileLink}
                  alt={gallery.clubName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 무한스크롤 센티넬 & 상태 표시 */}
      {visibleGalleries.length > 0 && (
        <>
          <div ref={sentinelRef} className="h-10" />
          <div className="flex items-center justify-center py-6">
            {isAppending && (
              <div className="text-gray-400 text-sm animate-pulse">더 불러오는 중…</div>
            )}
            {!loading && noMore && galleries.length > BATCH_SIZE && (
              <div className="text-gray-400 text-sm">더 이상 갤러리가 없습니다.</div>
            )}
          </div>
        </>
      )}

      {isDetailOpen && selectedGallery && (
        <GalleryDetailModal
          gallery={selectedGallery}
          onClose={() => setIsDetailOpen(false)}
          onDelete={handleDeleteSuccess}
        />
      )}

      {isUploadOpen && (
        <GalleryUploadModal
          joinedClubs={joinedClubs}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
