import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { clubApi } from '../../services/api/clubApi';
import { galleryApi } from '../../services/api/galleryApi';

import defaultProfile from '../../assets/images/default-profile.png';
import GalleryUploadModal from '../gallery/GalleryUploadModal';
import GalleryDetailModal from '../gallery/GalleryDetailModal';

export default function ClubDetail() {
  const { clubId } = useParams();

  const [club, setClub] = useState(null);
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchClubData();
    fetchUserRole();
  }, [clubId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchClubData = async () => {
    try {
      setLoading(true);
      const clubData = await clubApi.getClubDetail(clubId);
      setClub(clubData);
      const galleryData = await galleryApi.getGalleryList(clubId);
      setGalleries(galleryData || []);
    } catch (e) {
      console.error(e);
      alert('동호회 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async () => {
    try {
      const clubs = await clubApi.getJoinedClubs();
      const current = clubs.find((c) => String(c.clubId) === String(clubId));
      if (current) setUserRole(current.role);
    } catch (e) {
      console.error('역할 조회 실패:', e);
    }
  };

  const isManager = userRole === 'LEADER' || userRole === 'MANAGER';

  const handleDeleteGallery = async (galleryId) => {
    if (!window.confirm('이 사진을 삭제하시겠습니까?')) return;
    try {
      await galleryApi.deleteGallery(galleryId);
      alert('사진이 삭제되었습니다.');
      setOpenMenuId(null);
      await fetchClubData();
    } catch (e) {
      console.error(e);
      alert('사진 삭제에 실패했습니다.');
    }
  };

  const handleUploadSuccess = async () => {
    setIsUploadModalOpen(false);
    await fetchClubData();
  };

  const handleImageClick = async (g) => {
    try {
      const detail = await galleryApi.getGallery(g.galleryId);
      setSelectedGallery({
        ...g,
        ...detail,
        clubName: club.clubName,
        clubProfileImage: club.fileLink,
      });
      setIsDetailModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedGallery(null);
  };

  const handleDeleteSuccess = async () => {
    setIsDetailModalOpen(false);
    setSelectedGallery(null);
    await fetchClubData();
  };

  const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

  const getProfileSrc = (url) =>
    !url || url.trim() === '' || url === 'null' ? defaultProfile : url;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center text-gray-500">동호회를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="relative w-fit mx-auto">
          {isManager && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="absolute top-1 -right-12 px-4 py-2 text-xs rounded-md bg-[#4FA3FF] text-white hover:bg-blue-600"
            >
              등록
            </button>
          )}

          <div className="flex items-start justify-center gap-8">
            <div className="w-36 h-36 rounded-full overflow-hidden bg-white flex-shrink-0 ring-1 ring-transparent">
              <img
                src={getProfileSrc(club.fileLink)}
                alt={club.clubName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="pt-2 max-w-xl">
              <h1 className="text-xl font-bold text-gray-900">{club.clubName}</h1>

              <div className="flex items-center gap-6 text-sm text-gray-700 mb-3">
                <div>
                  <span className="font-semibold">사진</span> {galleries.length}
                </div>
              </div>

              <p className="text-sm text-gray-700 leading-6 whitespace-pre-wrap">
                {club.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200 mb-4" />

      <div className="grid grid-cols-3 gap-[2px] md:gap-1">
        {galleries.length === 0 ? (
          <div className="col-span-3 text-center py-20 text-gray-500">등록된 사진이 없습니다.</div>
        ) : (
          galleries.map((g) => (
            <div
              key={g.galleryId}
              className="relative group aspect-square bg-gray-100 overflow-hidden"
            >
              {g.fileLink ? (
                <img
                  src={g.fileLink}
                  alt=""
                  onClick={() => handleImageClick(g)}
                  className="w-full h-full object-cover cursor-pointer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              {isManager && (
                <div
                  ref={openMenuId === g.galleryId ? menuRef : null}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    onClick={() => toggleMenu(g.galleryId)}
                    className="w-7 h-7 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>

                  {openMenuId === g.galleryId && (
                    <div className="absolute right-0 mt-1 w-24 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <button
                        onClick={() => handleDeleteGallery(g.galleryId)}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isUploadModalOpen && (
        <GalleryUploadModal
          joinedClubs={[{ clubId: parseInt(clubId), name: club.clubName }]}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
          preSelectedClubId={parseInt(clubId)}
        />
      )}

      {isDetailModalOpen && selectedGallery && (
        <GalleryDetailModal
          gallery={selectedGallery}
          onClose={handleDetailModalClose}
          onDelete={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
