import { useState, useEffect, useRef } from 'react';
import { galleryApi } from '../../services/api/galleryApi';
import { clubApi } from '../../services/api/clubApi';
import useUserStore from '../../store/useUserStore';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useNavigate } from 'react-router-dom';
import defaultProfile from '../../assets/images/default-profile.png';
export default function GalleryDetailModal({ gallery, onClose, onDelete }) {
  const { user, isAuthenticated: isLoggedIn } = useUserStore();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(gallery.likeCount || 0);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      fetchLikeStatus();
      fetchUserRole();
    }
  }, [gallery.galleryId, isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLikeStatus = async () => {
    try {
      const response = await galleryApi.getGalleryLikeStatus(gallery.galleryId);
      setIsLiked(response.isLiked || false);
      if (response.likeCount !== undefined) {
        setLikeCount(response.likeCount);
      }
    } catch (error) {
      console.error('좋아요 상태 조회 실패:', error);
    }
  };

  // 사용자의 동호회 내 역할 조회
  const fetchUserRole = async () => {
    try {
      const clubs = await clubApi.getJoinedClubs();
      const currentClub = clubs.find((c) => c.clubId === gallery.clubId);
      if (currentClub) {
        setUserRole(currentClub.role);
      }
    } catch (error) {
      console.error('역할 조회 실패:', error);
    }
  };

  const handleLikeToggle = async () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      setLoading(true);
      const response = await galleryApi.toggleGalleryLike(gallery.galleryId);
      setIsLiked(response.isLiked);
      setLikeCount(response.likeCount);
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
      alert('좋아요 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await galleryApi.deleteGallery(gallery.galleryId);
      alert('갤러리가 삭제되었습니다.');
      onDelete();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  // 작성자 본인이거나 운영진/모임장인 경우 삭제 가능
  const isAuthor = isLoggedIn && user?.memberId === gallery.createdBy;
  const isManager = userRole === 'LEADER' || userRole === 'MANAGER';
  const canDelete = isAuthor || isManager;

  return (
    <div
      className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-none w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 이미지 영역 */}
        <div className="bg-gray-200 flex items-center justify-center" style={{ height: '520px' }}>
          {gallery.fileLink ? (
            <img
              src={gallery.fileLink}
              alt={gallery.clubName}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-20 h-20 text-gray-400"
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
        </div>

        {/* 정보 영역 */}
        <div className="p-4">
          {/* 동호회 정보 & 좋아요 & 메뉴 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative w-11 h-11 rounded-full overflow-hidden bg-white ring-1 ring-transparent flex-shrink-0">
                <img
                  src={gallery.clubProfileImage || defaultProfile}
                  alt={gallery.clubName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                onClick={() => navigate(`/clubs/${gallery.clubId}`)} // 백틱 사용!
                className="font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600"
              >
                {gallery.clubName}
              </div>
            </div>

            {/* 좋아요 & 메뉴 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleLikeToggle}
                disabled={loading || !isLoggedIn}
                className="flex items-center gap-1 disabled:opacity-50"
              >
                <svg
                  className={`w-6 h-6 ${
                    isLiked ? 'fill-red-500 text-red-500' : 'fill-none text-gray-400'
                  }`}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="text-sm text-gray-600">{likeCount}</span>
              </button>

              {/* 삭제 메뉴 - 작성자 또는 운영진/모임장만 표시 */}
              {canDelete && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
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

                  {showMenu && (
                    <div className="absolute right-0 mt-1 w-24 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button
                        onClick={handleDeleteClick}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 작성자 & 날짜 정보 */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <div className="relative w-11 h-11 rounded-full overflow-hidden bg-white ring-1 ring-transparent flex-shrink-0">
              <img
                src={gallery.memberProfileImage || defaultProfile}
                alt={gallery.nickname}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-gray-700">{gallery.nickname || '익명'}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">{gallery.createdAt}</span>
          </div>

          {/* 닫기 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
            >
              닫기
            </button>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="사진 삭제"
        message="정말 삭제하시겠습니까?"
        confirmText="확인"
        cancelText="취소"
      />
    </div>
  );
}
