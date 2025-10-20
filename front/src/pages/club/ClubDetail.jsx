import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clubApi } from '../../services/api/clubApi';
import { galleryApi } from '../../services/api/galleryApi';
import useUserStore from '../../store/useUserStore';

const DEFAULT_PROFILE = 'https://via.placeholder.com/200x200/e0e0e0/666666?text=No+Image';

export default function ClubDetail() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [club, setClub] = useState(null);
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    fetchClubData();
    fetchUserRole();
  }, [clubId]);

  const fetchClubData = async () => {
    try {
      setLoading(true);

      const clubData = await clubApi.getClubDetail(clubId);
      setClub(clubData);

      const galleryData = await galleryApi.getGalleryList(clubId);
      setGalleries(galleryData || []);
    } catch (error) {
      console.error('동호회 정보 조회 실패:', error);
      alert('동호회 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async () => {
    try {
      const clubs = await clubApi.getJoinedClubs();
      const currentClub = clubs.find((c) => String(c.clubId) === String(clubId));
      if (currentClub) {
        setUserRole(currentClub.role);
      }
    } catch (error) {
      console.error('역할 조회 실패:', error);
    }
  };

  const isManager = userRole === '모임장' || userRole === '운영진';

  const handleDeleteGallery = async (galleryId) => {
    if (!window.confirm('이 사진을 삭제하시겠습니까?')) return;

    try {
      await galleryApi.deleteGallery(galleryId);
      alert('사진이 삭제되었습니다.');
      setOpenMenuId(null);
      await fetchClubData();
    } catch (error) {
      console.error('사진 삭제 실패:', error);
      alert('사진 삭제에 실패했습니다.');
    }
  };

  const toggleMenu = (galleryId) => {
    setOpenMenuId(openMenuId === galleryId ? null : galleryId);
  };

  const getProfileSrc = (url) => {
    if (!url || url.trim() === '' || url === 'null') {
      return DEFAULT_PROFILE;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center text-gray-500">동호회를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* 상단 헤더 */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          {/* 프로필 이미지 */}
          <div className="w-32 h-32 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
            <img
              src={getProfileSrc(club.fileLink)}
              alt={club.clubName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 편집 버튼 */}
          <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600">
            편집
          </button>
        </div>

        {/* 동호회 정보 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{club.clubName}</h1>

          <div className="text-gray-600 mb-4">
            <span className="font-medium">사진</span> {galleries.length}
          </div>

          <div className="text-gray-700 whitespace-pre-wrap">{club.description}</div>
        </div>
      </div>

      {/* 사진 섹션 */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">사진</h2>

        {galleries.length === 0 ? (
          <div className="text-center py-20 text-gray-500">등록된 사진이 없습니다.</div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {galleries.map((gallery) => (
              <div
                key={gallery.galleryId}
                className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden"
              >
                {gallery.fileLink ? (
                  <img
                    src={gallery.fileLink}
                    alt="갤러리 이미지"
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}

                {/* 오버플로우 메뉴 - 운영진만 표시 */}
                {isManager && (
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleMenu(gallery.galleryId)}
                      className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100"
                    >
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    {openMenuId === gallery.galleryId && (
                      <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => handleDeleteGallery(gallery.galleryId)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
