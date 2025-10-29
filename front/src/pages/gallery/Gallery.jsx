import { useState, useEffect, useRef } from 'react';
import { galleryApi } from '../../services/api/galleryApi';
import { clubApi } from '../../services/api/clubApi';
import useUserStore from '../../store/useUserStore';
import GalleryDetailModal from './GalleryDetailModal';
import GalleryUploadModal from './GalleryUploadModal';
import AlertModal from '../../components/common/AlertModal';
import { useAlert } from '../../hooks/useAlert';
import { Bars3Icon } from '@heroicons/react/24/outline';

const BATCH_SIZE = 9;

export default function Gallery() {
  const { isAuthenticated: isLoggedIn } = useUserStore();
  const { alertState, showAlert, closeAlert } = useAlert();

  const [galleries, setGalleries] = useState([]);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [selectedClubIds, setSelectedClubIds] = useState([]); // 배열로 변경
  const [loading, setLoading] = useState(true);

  const [selectedGallery, setSelectedGallery] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isAppending, setIsAppending] = useState(false);
  const [noMore, setNoMore] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchGalleries();
    setVisibleCount(BATCH_SIZE);
    setNoMore(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [selectedClubIds]);

  // 필터 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFilterDropdown]);

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
      showAlert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleries = async () => {
    try {
      // 선택된 동호회가 없으면 전체 조회
      if (selectedClubIds.length === 0) {
        const galleriesData = await galleryApi.getGalleryList();
        setGalleries(galleriesData || []);
      } else {
        // 선택된 동호회들의 갤러리를 가져와서 합침
        const allGalleries = [];
        for (const clubId of selectedClubIds) {
          const galleriesData = await galleryApi.getGalleryList(clubId);
          if (galleriesData && galleriesData.length > 0) {
            allGalleries.push(...galleriesData);
          }
        }

        // galleryId 기준으로 중복 제거 (혹시 모를 중복 방지)
        const uniqueGalleries = allGalleries.filter(
          (gallery, index, self) =>
            index === self.findIndex((g) => g.galleryId === gallery.galleryId),
        );

        setGalleries(uniqueGalleries);
      }
    } catch (error) {
      console.error('갤러리 조회 실패:', error);
      setGalleries([]);
    }
  };

  const handleImageClick = async (g) => {
    try {
      // MEMBER 공개 범위인 경우 권한 체크
      if (g.scope === 'MEMBER') {
        // 로그인 안했으면 차단
        if (!isLoggedIn) {
          showAlert('로그인 후 이용 가능합니다.', '');
          return;
        }

        // 해당 동호회의 회원인지 확인
        const isMember = joinedClubs.some(
          (club) => club.clubId === g.clubId && club.status === 'APPROVED',
        );

        if (!isMember) {
          showAlert('동호회 회원만 볼 수 있습니다.');
          return;
        }
      }

      const [detail, clubDetail] = await Promise.all([
        galleryApi.getGallery(g.galleryId),
        clubApi.getClubDetail(g.clubId),
      ]);

      setSelectedGallery({
        ...g,
        ...detail,
        clubName: clubDetail.clubName,
        clubProfileImage: clubDetail.fileLink,
      });
      setIsDetailOpen(true);
    } catch (e) {
      console.error(e);
      showAlert('상세 정보를 불러오는데 실패했습니다.');
    }
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
    if (clubId === null) {
      // 전체 보기
      setSelectedClubIds([]);
      setShowFilterDropdown(false);
      return;
    }
    setSelectedClubIds((prev) =>
      prev.includes(clubId) ? prev.filter((id) => id !== clubId) : [...prev, clubId],
    );
  };

  const visibleGalleries = galleries.slice(0, visibleCount);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center text-gray-500">로딩 중...</div>
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

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800">갤러리</h1>
        <div className="flex items-center gap-3">
          {isLoggedIn && joinedClubs.length > 0 && (
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => setShowFilterDropdown((v) => !v)}
                className="bg-white border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2"
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
                      <span>{club.name}</span>
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

          {isLoggedIn && joinedClubs.length > 0 && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2 bg-[#4FA3FF] text-white text-sm font-medium rounded-lg hover:bg-blue-600"
            >
              등록
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 md:gap-2">
        {visibleGalleries.length === 0 ? (
          <div className="col-span-3 text-center py-20 text-gray-500">
            등록된 갤러리가 없습니다.
          </div>
        ) : (
          visibleGalleries.map((gallery) => (
            <div
              key={gallery.galleryId}
              onClick={() => handleImageClick(gallery)}
              className="aspect-square bg-gray-200 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            >
              {gallery.fileLink ? (
                <img
                  src={gallery.fileLink}
                  alt={gallery.clubName}
                  className="w-full h-full object-cover object-center"
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
