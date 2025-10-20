import { useState, useEffect, useRef } from 'react';
import { galleryApi } from '../../services/api/galleryApi';
import useUserStore from '../../store/useUserStore';

export default function GalleryDetailModal({ gallery, onClose, onDelete }) {
  const { user, isAuthenticated: isLoggedIn } = useUserStore();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(gallery.likeCount || 0);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchLikeStatus();
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
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await galleryApi.deleteGallery(gallery.galleryId);
      alert('갤러리가 삭제되었습니다.');
      onDelete();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const isAuthor = isLoggedIn && user?.memberId === gallery.createdBy;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-none w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 이미지 영역 */}
        <div className="bg-gray-200 flex items-center justify-center" style={{ height: '400px' }}>
          {gallery.fileLink ? (
            <img
              src={gallery.fileLink}
              alt={gallery.clubName}
              className="w-full h-full object-cover"
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
              <div className="w-11 h-11 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-900 truncate">{gallery.clubName}</div>
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
                  className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
                  fill={isLiked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-900">{likeCount}</span>
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-none shadow-lg z-10">
                    {isAuthor ? (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleDelete();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-none"
                      >
                        삭제
                      </button>
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-400">메뉴 없음</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 작성자 & 날짜 정보 */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-3 h-3 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
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
    </div>
  );
}
